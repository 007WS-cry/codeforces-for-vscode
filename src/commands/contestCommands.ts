import * as vscode from 'vscode';
import { ContestManager } from '../contest/contestManager';
import { createContestListWebview } from '../webview/contestList';
import { createContestDetailWebview } from '../webview/contestDetail';
import { createProblemListWebview } from '../webview/problemList';
import { notificationManager } from '../notification/notificationManager';
import { ContestPhase } from '../types';

export function registerContestCommands(context: vscode.ExtensionContext): void {
    const contestManager = ContestManager.getInstance(context);
    const contestListWebview = createContestListWebview(context);
    const contestDetailWebview = createContestDetailWebview(context);
    const problemListWebview = createProblemListWebview(context);

    // 显示竞赛列表
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showContestList', async () => {
            try {
                await contestListWebview.show();
            } catch (error) {
                notificationManager.showError(`Failed to show contest list: ${error}`);
            }
        })
    );

    // 显示竞赛详情
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showContestDetail', async (contestId: number) => {
            try {
                await contestDetailWebview.show(contestId);
            } catch (error) {
                notificationManager.showError(`Failed to show contest detail: ${error}`);
            }
        })
    );

    // 显示题目列表
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showProblemList', async (contestId: number) => {
            try {
                await problemListWebview.show(contestId);
            } catch (error) {
                notificationManager.showError(`Failed to show problem list: ${error}`);
            }
        })
    );

    // 注册竞赛
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.registerContest', async (contestId: number) => {
            try {
                const success = await contestManager.registerForContest(contestId);
                if (success) {
                    notificationManager.showInfo('Successfully registered for contest');
                } else {
                    notificationManager.showError('Failed to register for contest');
                }
            } catch (error) {
                notificationManager.showError(`Registration failed: ${error}`);
            }
        })
    );

    // 刷新竞赛列表
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.refreshContests', async () => {
            try {
                await contestManager.getContests(true);
                notificationManager.showInfo('Contest list refreshed');
            } catch (error) {
                notificationManager.showError(`Failed to refresh contests: ${error}`);
            }
        })
    );

    // 显示即将开始的竞赛
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showUpcomingContests', async () => {
            try {
                const contests = await contestManager.getContests();
                const upcomingContests = contests.filter(c => c.phase === ContestPhase.BEFORE);
                
                if (upcomingContests.length === 0) {
                    notificationManager.showInfo('No upcoming contests');
                    return;
                }

                const items = upcomingContests.map(contest => ({
                    label: contest.name,
                    description: new Date(contest.startTimeSeconds! * 1000).toLocaleString(),
                    contest
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a contest to view'
                });

                if (selected) {
                    await contestDetailWebview.show(selected.contest.id);
                }
            } catch (error) {
                notificationManager.showError(`Failed to show upcoming contests: ${error}`);
            }
        })
    );

    // 显示正在进行的竞赛
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showActiveContests', async () => {
            try {
                const contests = await contestManager.getContests();
                const activeContests = contests.filter(c => c.phase === ContestPhase.CODING);
                
                if (activeContests.length === 0) {
                    notificationManager.showInfo('No active contests');
                    return;
                }

                const items = activeContests.map(contest => ({
                    label: contest.name,
                    description: `Ends in ${Math.floor((contest.startTimeSeconds! + contest.durationSeconds - Date.now()/1000)/60)} minutes`,
                    contest
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a contest to view'
                });

                if (selected) {
                    await contestDetailWebview.show(selected.contest.id);
                }
            } catch (error) {
                notificationManager.showError(`Failed to show active contests: ${error}`);
            }
        })
    );

    // 打开竞赛页面
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.openContestPage', async (contestId: number) => {
            try {
                const url = `https://codeforces.com/contest/${contestId}`;
                await vscode.env.openExternal(vscode.Uri.parse(url));
            } catch (error) {
                notificationManager.showError(`Failed to open contest page: ${error}`);
            }
        })
    );

    // 清理通知历史
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.clearNotifications', () => {
            try {
                notificationManager.clearNotificationHistory();
                notificationManager.showInfo('Notification history cleared');
            } catch (error) {
                notificationManager.showError(`Failed to clear notifications: ${error}`);
            }
        })
    );
} 