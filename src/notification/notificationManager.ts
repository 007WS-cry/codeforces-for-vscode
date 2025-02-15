import * as vscode from 'vscode';
import { ContestNotificationManager } from './contestNotification';
import { IContestInfo, IContestNotificationConfig } from '../types';
import { ContestStatusTracker, IContestStatusInfo } from '../contest/contestStatus';

export class NotificationManager {
    private static instance: NotificationManager;
    private readonly contestNotifier: ContestNotificationManager;
    private readonly statusTracker: ContestStatusTracker;
    private disposables: vscode.Disposable[] = [];

    private constructor() {
        this.contestNotifier = ContestNotificationManager.getInstance();
        this.statusTracker = ContestStatusTracker.getInstance();

        // 监听竞赛状态变更
        this.disposables.push(
            this.statusTracker.onDidChangeStatus(this.handleStatusChange.bind(this))
        );
    }

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    // 更新通知配置
    public updateConfig(config: Partial<IContestNotificationConfig>): void {
        this.contestNotifier.updateConfig(config);
    }

    // 处理竞赛状态变更
    private handleStatusChange(statusInfo: IContestStatusInfo): void {
        this.contestNotifier.handleStatusChange(statusInfo);
    }

    // 处理排名变更
    public handleRankingChange(contest: IContestInfo, oldRank: number, newRank: number): void {
        this.contestNotifier.handleRankingChange(contest, oldRank, newRank);
    }

    // 检查竞赛时间提醒
    public checkTimeNotifications(contests: IContestInfo[]): void {
        contests.forEach(contest => {
            this.contestNotifier.checkTimeNotifications(contest);
        });
    }

    // 显示错误通知
    public showError(message: string, ...actions: string[]): Thenable<string | undefined> {
        return vscode.window.showErrorMessage(message, ...actions);
    }

    // 显示信息通知
    public showInfo(message: string, ...actions: string[]): Thenable<string | undefined> {
        return vscode.window.showInformationMessage(message, ...actions);
    }

    // 显示警告通知
    public showWarning(message: string, ...actions: string[]): Thenable<string | undefined> {
        return vscode.window.showWarningMessage(message, ...actions);
    }

    // 显示进度通知
    public async withProgress<T>(
        title: string,
        task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Thenable<T>
    ): Promise<T> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            },
            task
        );
    }

    // 显示状态栏通知
    public showStatusBarMessage(
        message: string,
        hideAfterTimeout?: number
    ): vscode.Disposable {
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        statusBarItem.text = message;
        statusBarItem.show();

        if (hideAfterTimeout) {
            setTimeout(() => {
                statusBarItem.dispose();
            }, hideAfterTimeout);
        }

        return statusBarItem;
    }

    // 清理通知历史
    public clearNotificationHistory(): void {
        this.contestNotifier.clearNotificationHistory();
    }

    // 注册命令
    public registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('codeforces.clearNotifications', () => {
                this.clearNotificationHistory();
                this.showInfo('Notification history cleared');
            })
        );
    }

    // 清理资源
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.contestNotifier.dispose();
    }
}

// 导出单例实例
export const notificationManager = NotificationManager.getInstance(); 