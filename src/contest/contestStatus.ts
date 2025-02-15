import * as vscode from 'vscode';
import { IContestInfo, ContestPhase } from '../types';

// 竞赛状态枚举
export enum ContestStatusType {
    NotStarted = 'NotStarted',
    Starting = 'Starting',      // 即将开始（15分钟内）
    Running = 'Running',
    Ending = 'Ending',         // 即将结束（15分钟内）
    SystemTesting = 'SystemTesting',
    Finished = 'Finished',
    Error = 'Error'
}

// 竞赛状态接口
export interface IContestStatusInfo {
    type: ContestStatusType;
    contest: IContestInfo;
    timeRemaining?: number;     // 剩余时间（秒）
    message?: string;           // 状态消息
}

export class ContestStatusTracker {
    private static instance: ContestStatusTracker;
    private readonly _onDidChangeStatus = new vscode.EventEmitter<IContestStatusInfo>();
    private statusCheckInterval: NodeJS.Timeout | null = null;
    private currentStatuses: Map<number, IContestStatusInfo> = new Map();

    public readonly onDidChangeStatus = this._onDidChangeStatus.event;

    private constructor() {
        this.startStatusChecking();
    }

    public static getInstance(): ContestStatusTracker {
        if (!ContestStatusTracker.instance) {
            ContestStatusTracker.instance = new ContestStatusTracker();
        }
        return ContestStatusTracker.instance;
    }

    // 更新竞赛状态
    public updateContestStatus(contest: IContestInfo): IContestStatusInfo {
        const now = Math.floor(Date.now() / 1000);
        const status = this.calculateStatus(contest, now);
        
        // 检查状态是否发生变化
        const currentStatus = this.currentStatuses.get(contest.id);
        if (!currentStatus || currentStatus.type !== status.type) {
            this.currentStatuses.set(contest.id, status);
            this._onDidChangeStatus.fire(status);
        }

        return status;
    }

    // 获取竞赛状态
    public getContestStatus(contestId: number): IContestStatusInfo | undefined {
        return this.currentStatuses.get(contestId);
    }

    // 计算竞赛状态
    private calculateStatus(contest: IContestInfo, now: number): IContestStatusInfo {
        const startTime = contest.startTimeSeconds || 0;
        const endTime = startTime + contest.durationSeconds;
        const timeToStart = startTime - now;
        const timeToEnd = endTime - now;

        let type: ContestStatusType;
        let message: string;
        let timeRemaining: number | undefined;

        try {
            if (contest.phase === ContestPhase.FINISHED) {
                type = ContestStatusType.Finished;
                message = 'Contest has finished';
            } else if (contest.phase === ContestPhase.SYSTEM_TEST) {
                type = ContestStatusType.SystemTesting;
                message = 'System testing in progress';
            } else if (timeToStart > 900) { // 15分钟以上
                type = ContestStatusType.NotStarted;
                message = `Contest starts in ${Math.floor(timeToStart / 60)} minutes`;
                timeRemaining = timeToStart;
            } else if (timeToStart > 0) {
                type = ContestStatusType.Starting;
                message = `Contest starts in ${Math.floor(timeToStart / 60)} minutes`;
                timeRemaining = timeToStart;
            } else if (timeToEnd > 900) { // 15分钟以上
                type = ContestStatusType.Running;
                message = `Contest ends in ${Math.floor(timeToEnd / 60)} minutes`;
                timeRemaining = timeToEnd;
            } else if (timeToEnd > 0) {
                type = ContestStatusType.Ending;
                message = `Contest ends in ${Math.floor(timeToEnd / 60)} minutes`;
                timeRemaining = timeToEnd;
            } else {
                type = ContestStatusType.Finished;
                message = 'Contest has finished';
            }
        } catch (error) {
            type = ContestStatusType.Error;
            message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        return {
            type,
            contest,
            timeRemaining,
            message
        };
    }

    // 开始状态检查
    private startStatusChecking(): void {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }

        // 每分钟检查一次状态
        this.statusCheckInterval = setInterval(() => {
            this.currentStatuses.forEach((status) => {
                this.updateContestStatus(status.contest);
            });
        }, 60000);
    }

    // 停止状态检查
    private stopStatusChecking(): void {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    // 清理资源
    public dispose(): void {
        this.stopStatusChecking();
        this._onDidChangeStatus.dispose();
        this.currentStatuses.clear();
    }
}

// 导出单例实例
export const contestStatusTracker = ContestStatusTracker.getInstance(); 