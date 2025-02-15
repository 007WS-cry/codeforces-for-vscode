import * as vscode from 'vscode';
import {
    IContestCache,
    IContestInfo,
    IContestStatus,
    IContestRanking
} from '../types';

export class ContestCache {
    private static instance: ContestCache;
    private cache: IContestCache;
    private readonly cacheKey = 'contestCache';
    private readonly _onDidUpdateCache = new vscode.EventEmitter<IContestCache>();

    public readonly onDidUpdateCache = this._onDidUpdateCache.event;

    private constructor(private context: vscode.ExtensionContext) {
        // 初始化缓存
        this.cache = {
            lastUpdate: 0,
            contests: [],
            userStatus: {},
            rankings: {}
        };

        // 从存储中恢复缓存
        this.loadCache();
    }

    public static getInstance(context: vscode.ExtensionContext): ContestCache {
        if (!ContestCache.instance) {
            ContestCache.instance = new ContestCache(context);
        }
        return ContestCache.instance;
    }

    // 获取竞赛列表
    public getContests(): IContestInfo[] {
        return this.cache.contests;
    }

    // 更新竞赛列表
    public updateContests(contests: IContestInfo[]): void {
        this.cache.contests = contests;
        this.cache.lastUpdate = Date.now();
        this.saveCache();
        this._onDidUpdateCache.fire(this.cache);
    }

    // 获取竞赛状态
    public getContestStatus(contestId: number): IContestStatus | undefined {
        return this.cache.userStatus[contestId];
    }

    // 更新竞赛状态
    public updateContestStatus(contestId: number, status: IContestStatus): void {
        this.cache.userStatus[contestId] = status;
        this.saveCache();
        this._onDidUpdateCache.fire(this.cache);
    }

    // 获取竞赛排名
    public getContestRanking(contestId: number): IContestRanking | undefined {
        return this.cache.rankings[contestId];
    }

    // 更新竞赛排名
    public updateContestRanking(contestId: number, ranking: IContestRanking): void {
        this.cache.rankings[contestId] = ranking;
        this.saveCache();
        this._onDidUpdateCache.fire(this.cache);
    }

    // 检查缓存是否过期
    public isExpired(maxAge: number): boolean {
        const now = Date.now();
        return (now - this.cache.lastUpdate) > (maxAge * 1000);
    }

    // 清除特定竞赛的缓存
    public clearContestCache(contestId: number): void {
        delete this.cache.userStatus[contestId];
        delete this.cache.rankings[contestId];
        this.saveCache();
        this._onDidUpdateCache.fire(this.cache);
    }

    // 清除所有缓存
    public clearAllCache(): void {
        this.cache = {
            lastUpdate: 0,
            contests: [],
            userStatus: {},
            rankings: {}
        };
        this.saveCache();
        this._onDidUpdateCache.fire(this.cache);
    }

    // 保存缓存到存储
    private async saveCache(): Promise<void> {
        try {
            await this.context.globalState.update(this.cacheKey, this.cache);
        } catch (error) {
            console.error('Failed to save contest cache:', error);
            vscode.window.showErrorMessage('Failed to save contest cache');
        }
    }

    // 从存储加载缓存
    private loadCache(): void {
        try {
            const savedCache = this.context.globalState.get<IContestCache>(this.cacheKey);
            if (savedCache) {
                this.cache = savedCache;
            }
        } catch (error) {
            console.error('Failed to load contest cache:', error);
            vscode.window.showErrorMessage('Failed to load contest cache');
        }
    }

    // 获取缓存最后更新时间
    public getLastUpdateTime(): number {
        return this.cache.lastUpdate;
    }

    // 获取缓存大小（字节）
    public getCacheSize(): number {
        return JSON.stringify(this.cache).length;
    }

    // 清理资源
    public dispose(): void {
        this._onDidUpdateCache.dispose();
    }
}

// 导出单例实例创建函数
export function getContestCache(context: vscode.ExtensionContext): ContestCache {
    return ContestCache.getInstance(context);
} 