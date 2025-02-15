import * as vscode from 'vscode';
import { codeforcesAPI } from '../utils/api';
import {
    IContestInfo,
    IContestStatus,
    IContestCache,
    IContestManagerConfig,
    ContestPhase
} from '../types';

export class ContestManager {
    private static instance: ContestManager;
    private cache: IContestCache;
    private config: IContestManagerConfig;
    private refreshTimer: NodeJS.Timeout | null = null;
    private readonly _onDidChangeContests = new vscode.EventEmitter<IContestInfo[]>();
    private readonly _onDidChangeStatus = new vscode.EventEmitter<IContestStatus>();

    public readonly onDidChangeContests = this._onDidChangeContests.event;
    public readonly onDidChangeStatus = this._onDidChangeStatus.event;

    private constructor(private context: vscode.ExtensionContext) {
        // 初始化缓存
        this.cache = {
            lastUpdate: 0,
            contests: [],
            userStatus: {},
            rankings: {}
        };

        // 初始化配置
        this.config = {
            autoRefresh: true,
            refreshInterval: 300, // 5分钟
            maxCacheAge: 600,    // 10分钟
            notifications: {
                enabled: true,
                beforeStart: [15, 5, 1],  // 比赛前15/5/1分钟提醒
                beforeEnd: [15, 5, 1],    // 比赛结束前15/5/1分钟提醒
                statusChange: true,
                rankingChange: true
            }
        };

        // 从存储中恢复缓存
        this.loadCache();
        
        // 如果启用了自动刷新，开始定时更新
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    public static getInstance(context: vscode.ExtensionContext): ContestManager {
        if (!ContestManager.instance) {
            ContestManager.instance = new ContestManager(context);
        }
        return ContestManager.instance;
    }

    // 获取竞赛列表
    public async getContests(forceRefresh: boolean = false): Promise<IContestInfo[]> {
        if (forceRefresh || this.shouldRefreshCache()) {
            await this.refreshContests();
        }
        return this.cache.contests;
    }

    // 获取正在进行的竞赛
    public async getActiveContests(): Promise<IContestInfo[]> {
        const contests = await this.getContests();
        return contests.filter(contest => contest.phase === ContestPhase.CODING);
    }

    // 获取即将开始的竞赛
    public async getUpcomingContests(): Promise<IContestInfo[]> {
        const contests = await this.getContests();
        return contests.filter(contest => contest.phase === ContestPhase.BEFORE)
            .sort((a, b) => (a.startTimeSeconds || 0) - (b.startTimeSeconds || 0));
    }

    // 获取竞赛状态
    public async getContestStatus(contestId: number): Promise<IContestStatus | null> {
        try {
            const status = await codeforcesAPI.getContestStatus(contestId);
            this.cache.userStatus[contestId] = status;
            this._onDidChangeStatus.fire(status);
            return status;
        } catch (error) {
            console.error(`Failed to get contest status: ${error}`);
            return null;
        }
    }

    // 注册参加竞赛
    public async registerForContest(contestId: number): Promise<boolean> {
        try {
            const success = await codeforcesAPI.registerForContest(contestId);
            if (success) {
                // 更新状态缓存
                await this.getContestStatus(contestId);
                vscode.window.showInformationMessage('Successfully registered for contest');
            }
            return success;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to register for contest: ${error}`);
            return false;
        }
    }

    // 刷新竞赛列表
    private async refreshContests(): Promise<void> {
        try {
            const contests = await codeforcesAPI.getContestList();
            this.cache.contests = contests;
            this.cache.lastUpdate = Date.now();
            this._onDidChangeContests.fire(contests);
            
            // 保存缓存
            await this.saveCache();
            
            // 检查是否需要发送通知
            this.checkContestNotifications();
        } catch (error) {
            console.error(`Failed to refresh contests: ${error}`);
        }
    }

    // 检查是否需要刷新缓存
    private shouldRefreshCache(): boolean {
        const now = Date.now();
        return (now - this.cache.lastUpdate) > (this.config.maxCacheAge * 1000);
    }

    // 开始自动刷新
    private startAutoRefresh(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.refreshTimer = setInterval(
            () => this.refreshContests(),
            this.config.refreshInterval * 1000
        );
    }


    // 停止自动刷新
    private stopAutoRefresh(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // 保存缓存到存储
    private async saveCache(): Promise<void> {
        await this.context.globalState.update('contestCache', this.cache);
    }

    // 从存储加载缓存
    private loadCache(): void {
        const savedCache = this.context.globalState.get<IContestCache>('contestCache');
        if (savedCache) {
            this.cache = savedCache;
        }
    }

    // 检查竞赛通知
    private checkContestNotifications(): void {
        if (!this.config.notifications.enabled) {
            return;
        }

        const now = Date.now() / 1000;
        this.cache.contests.forEach(contest => {
            if (contest.startTimeSeconds) {
                // 检查比赛开始前的提醒
                const timeToStart = contest.startTimeSeconds - now;
                this.config.notifications.beforeStart.forEach(minutes => {
                    if (Math.abs(timeToStart - minutes * 60) < 30) { // 30秒误差范围
                        vscode.window.showInformationMessage(
                            `Contest "${contest.name}" will start in ${minutes} minutes!`
                        );
                    }
                });

                // 检查比赛结束前的提醒
                if (contest.phase === ContestPhase.CODING) {
                    const timeToEnd = (contest.startTimeSeconds + contest.durationSeconds) - now;
                    this.config.notifications.beforeEnd.forEach(minutes => {
                        if (Math.abs(timeToEnd - minutes * 60) < 30) {
                            vscode.window.showInformationMessage(
                                `Contest "${contest.name}" will end in ${minutes} minutes!`
                            );
                        }
                    });
                }
            }
        });
    }

    // 更新配置
    public updateConfig(newConfig: Partial<IContestManagerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // 根据新配置调整自动刷新
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
    }

    // 清理资源
    public dispose(): void {
        this.stopAutoRefresh();
        this._onDidChangeContests.dispose();
        this._onDidChangeStatus.dispose();
    }
} 