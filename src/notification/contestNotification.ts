import * as vscode from 'vscode';
import { IContestInfo, ContestPhase, IContestNotificationConfig } from '../types';
import { ContestStatusType, IContestStatusInfo } from '../contest/contestStatus';

export class ContestNotificationManager {
    private static instance: ContestNotificationManager;
    private config: IContestNotificationConfig;
    private notifiedContests: Set<string> = new Set(); // 记录已发送通知的竞赛

    private constructor() {
        // 初始化默认配置
        this.config = {
            enabled: true,
            beforeStart: [15, 5, 1],  // 比赛前15/5/1分钟提醒
            beforeEnd: [15, 5, 1],    // 比赛结束前15/5/1分钟提醒
            statusChange: true,
            rankingChange: true
        };
    }

    public static getInstance(): ContestNotificationManager {
        if (!ContestNotificationManager.instance) {
            ContestNotificationManager.instance = new ContestNotificationManager();
        }
        return ContestNotificationManager.instance;
    }

    // 更新配置
    public updateConfig(newConfig: Partial<IContestNotificationConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    // 处理竞赛状态变更
    public handleStatusChange(statusInfo: IContestStatusInfo): void {
        if (!this.config.enabled || !this.config.statusChange) {
            return;
        }

        const contest = statusInfo.contest;
        const notificationKey = `${contest.id}-${statusInfo.type}`;

        // 检查是否已经发送过相同的通知
        if (this.notifiedContests.has(notificationKey)) {
            return;
        }

        let message = '';
        let buttons: vscode.MessageItem[] = [];

        switch (statusInfo.type) {
            case ContestStatusType.Starting:
                message = this.createStartingMessage(contest, statusInfo.timeRemaining);
                buttons = [{ title: 'Open Contest' }, { title: 'Register' }];
                break;
            case ContestStatusType.Ending:
                message = this.createEndingMessage(contest, statusInfo.timeRemaining);
                buttons = [{ title: 'Open Contest' }];
                break;
            case ContestStatusType.SystemTesting:
                message = `System testing has started for contest "${contest.name}"`;
                buttons = [{ title: 'View Results' }];
                break;
            case ContestStatusType.Finished:
                message = `Contest "${contest.name}" has finished`;
                buttons = [{ title: 'View Results' }];
                break;
        }

        if (message) {
            this.showNotification(message, buttons, contest);
            this.notifiedContests.add(notificationKey);
        }
    }

    // 处理排名变更
    public handleRankingChange(contest: IContestInfo, oldRank: number, newRank: number): void {
        if (!this.config.enabled || !this.config.rankingChange) {
            return;
        }

        const notificationKey = `${contest.id}-rank-${newRank}`;
        if (this.notifiedContests.has(notificationKey)) {
            return;
        }

        let message = '';
        if (newRank < oldRank) {
            message = `Your rank in "${contest.name}" improved from ${oldRank} to ${newRank}!`;
        } else if (newRank > oldRank) {
            message = `Your rank in "${contest.name}" dropped from ${oldRank} to ${newRank}`;
        }

        if (message) {
            this.showNotification(message, [{ title: 'View Standings' }], contest);
            this.notifiedContests.add(notificationKey);
        }
    }

    // 检查是否需要发送时间提醒
    public checkTimeNotifications(contest: IContestInfo): void {
        if (!this.config.enabled) {
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        
        if (contest.phase === ContestPhase.BEFORE) {
            this.checkStartTimeNotifications(contest, now);
        } else if (contest.phase === ContestPhase.CODING) {
            this.checkEndTimeNotifications(contest, now);
        }
    }

    // 创建开始提醒消息
    private createStartingMessage(contest: IContestInfo, timeRemaining?: number): string {
        if (!timeRemaining) {
            return `Contest "${contest.name}" is about to start`;
        }
        const minutes = Math.floor(timeRemaining / 60);
        return `Contest "${contest.name}" will start in ${minutes} minutes`;
    }

    // 创建结束提醒消息
    private createEndingMessage(contest: IContestInfo, timeRemaining?: number): string {
        if (!timeRemaining) {
            return `Contest "${contest.name}" is about to end`;
        }
        const minutes = Math.floor(timeRemaining / 60);
        return `Contest "${contest.name}" will end in ${minutes} minutes`;
    }

    // 检查开始时间提醒
    private checkStartTimeNotifications(contest: IContestInfo, now: number): void {
        if (!contest.startTimeSeconds) {
            return;
        }

        const timeToStart = contest.startTimeSeconds - now;
        this.config.beforeStart.forEach(minutes => {
            const notificationKey = `${contest.id}-start-${minutes}`;
            if (!this.notifiedContests.has(notificationKey) &&
                Math.abs(timeToStart - minutes * 60) < 30) { // 30秒误差范围
                const message = this.createStartingMessage(contest, minutes * 60);
                this.showNotification(message, [{ title: 'Open Contest' }, { title: 'Register' }], contest);
                this.notifiedContests.add(notificationKey);
            }
        });
    }

    // 检查结束时间提醒
    private checkEndTimeNotifications(contest: IContestInfo, now: number): void {
        if (!contest.startTimeSeconds) {
            return;
        }

        const timeToEnd = (contest.startTimeSeconds + contest.durationSeconds) - now;
        this.config.beforeEnd.forEach(minutes => {
            const notificationKey = `${contest.id}-end-${minutes}`;
            if (!this.notifiedContests.has(notificationKey) &&
                Math.abs(timeToEnd - minutes * 60) < 30) {
                const message = this.createEndingMessage(contest, minutes * 60);
                this.showNotification(message, [{ title: 'Open Contest' }], contest);
                this.notifiedContests.add(notificationKey);
            }
        });
    }

    // 显示通知
    private showNotification(
        message: string,
        buttons: vscode.MessageItem[],
        contest: IContestInfo
    ): void {
        vscode.window.showInformationMessage(message, ...buttons).then(selection => {
            if (selection) {
                this.handleNotificationAction(selection.title, contest);
            }
        });
    }

    // 处理通知按钮点击
    private handleNotificationAction(action: string, contest: IContestInfo): void {
        switch (action) {
            case 'Open Contest':
                if (contest.websiteUrl) {
                    vscode.env.openExternal(vscode.Uri.parse(contest.websiteUrl));
                }
                break;
            case 'Register':
                // 触发注册命令
                vscode.commands.executeCommand('codeforces.registerContest', contest.id);
                break;
            case 'View Results':
            case 'View Standings':
                // 触发查看结果命令
                vscode.commands.executeCommand('codeforces.viewContestResults', contest.id);
                break;
        }
    }

    // 清理通知记录
    public clearNotificationHistory(): void {
        this.notifiedContests.clear();
    }

    // 清理资源
    public dispose(): void {
        this.clearNotificationHistory();
    }
}

// 导出单例实例
export const contestNotificationManager = ContestNotificationManager.getInstance(); 