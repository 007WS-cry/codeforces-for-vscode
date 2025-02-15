import * as vscode from 'vscode';
import { ContestManager } from '../contest/contestManager';
import { IContestInfo, IContestStatus, ContestPhase } from '../types';
import { notificationManager } from '../notification/notificationManager';

export class ContestDetailWebview {
    private static instance: ContestDetailWebview;
    private panels: Map<number, vscode.WebviewPanel> = new Map();
    private contestManager: ContestManager;
    private disposables: vscode.Disposable[] = [];

    private constructor(private context: vscode.ExtensionContext) {
        this.contestManager = ContestManager.getInstance(context);

        // 监听竞赛状态变更
        this.disposables.push(
            this.contestManager.onDidChangeStatus((_status) => {
                // 从当前打开的面板中找到对应的竞赛ID
                this.panels.forEach((_panel, contestId) => {
                    this.updateContestView(contestId);
                });
            })
        );
    }

    public static getInstance(context: vscode.ExtensionContext): ContestDetailWebview {
        if (!ContestDetailWebview.instance) {
            ContestDetailWebview.instance = new ContestDetailWebview(context);
        }
        return ContestDetailWebview.instance;
    }

    // 显示竞赛详情
    public async show(contestId: number): Promise<void> {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const existingPanel = this.panels.get(contestId);
        if (existingPanel) {
            existingPanel.reveal(columnToShowIn);
            return;
        }

        try {
            const contest = await this.getContestInfo(contestId);
            if (!contest) {
                notificationManager.showError('Contest not found');
                return;
            }

            const panel = vscode.window.createWebviewPanel(
                `codeforcesContest-${contestId}`,
                `Contest: ${contest.name}`,
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(this.context.extensionUri, 'media')
                    ]
                }
            );

            panel.iconPath = vscode.Uri.joinPath(
                this.context.extensionUri,
                'media',
                'codeforces.png'
            );

            this.panels.set(contestId, panel);

            // 注册消息处理
            panel.webview.onDidReceiveMessage(
                message => this.handleMessage(contestId, message),
                null,
                this.disposables
            );

            // 监听面板关闭
            panel.onDidDispose(
                () => {
                    this.panels.delete(contestId);
                },
                null,
                this.disposables
            );

            await this.updateContestView(contestId);

        } catch (error) {
            notificationManager.showError(`Failed to open contest: ${error}`);
        }
    }

    // 更新竞赛视图
    private async updateContestView(contestId: number): Promise<void> {
        const panel = this.panels.get(contestId);
        if (!panel) {
            return;
        }

        try {
            const contest = await this.getContestInfo(contestId);
            const status = await this.contestManager.getContestStatus(contestId);
            if (contest) {
                panel.webview.html = this.getWebviewContent(contest, status);
            }
        } catch (error) {
            notificationManager.showError(`Failed to update contest view: ${error}`);
        }
    }

    // 获取竞赛信息
    private async getContestInfo(contestId: number): Promise<IContestInfo | undefined> {
        const contests = await this.contestManager.getContests();
        return contests.find(c => c.id === contestId);
    }

    // 处理 Webview 消息
    private async handleMessage(contestId: number, message: any): Promise<void> {
        switch (message.command) {
            case 'refresh':
                await this.updateContestView(contestId);
                break;
            case 'register':
                await this.handleRegistration(contestId);
                break;
            case 'openProblem':
                this.openProblemPage(contestId, message.problemIndex);
                break;
            case 'openStandings':
                this.openStandingsPage(contestId);
                break;
        }
    }

    // 处理竞赛注册
    private async handleRegistration(contestId: number): Promise<void> {
        try {
            const success = await this.contestManager.registerForContest(contestId);
            if (success) {
                notificationManager.showInfo('Successfully registered for contest');
                await this.updateContestView(contestId);
            } else {
                notificationManager.showError('Failed to register for contest');
            }
        } catch (error) {
            notificationManager.showError(`Registration failed: ${error}`);
        }
    }

    // 打开题目页面
    private openProblemPage(contestId: number, problemIndex: string): void {
        const url = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    // 打开排名页面
    private openStandingsPage(contestId: number): void {
        const url = `https://codeforces.com/contest/${contestId}/standings`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    // 生成 Webview 内容
    private getWebviewContent(contest: IContestInfo, status?: IContestStatus | null): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        padding: 20px;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                    }
                    .header {
                        margin-bottom: 20px;
                    }
                    .contest-info {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        padding: 15px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                    }
                    .info-item {
                        margin: 10px 0;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        margin-left: 10px;
                        font-size: 12px;
                    }
                    .actions {
                        margin: 20px 0;
                    }
                    button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 6px 12px;
                        margin-right: 8px;
                        cursor: pointer;
                        border-radius: 2px;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .refresh-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                    }
                </style>
            </head>
            <body>
                <button class="refresh-button" onclick="refresh()">Refresh</button>

                <div class="header">
                    <h1>${contest.name}</h1>
                    ${this.renderStatusBadge(contest, status)}
                </div>

                <div class="contest-info">
                    <div class="info-item">Type: ${contest.type}</div>
                    <div class="info-item">Duration: ${Math.floor(contest.durationSeconds / 3600)} hours</div>
                    ${contest.startTimeSeconds ? `
                        <div class="info-item">Start Time: ${new Date(contest.startTimeSeconds * 1000).toLocaleString()}</div>
                    ` : ''}
                    ${contest.preparedBy ? `
                        <div class="info-item">Prepared by: ${contest.preparedBy}</div>
                    ` : ''}
                    ${status ? `
                        <div class="info-item">Registration: ${status.registered ? 'Registered' : 'Not Registered'}</div>
                        <div class="info-item">Participation: ${status.participating ? 'Participating' : 'Not Participating'}</div>
                    ` : ''}
                </div>

                <div class="actions">
                    ${contest.phase === ContestPhase.BEFORE && (!status?.registered) ? `
                        <button onclick="register()">Register</button>
                    ` : ''}
                    <button onclick="openStandings()">View Standings</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    function register() {
                        vscode.postMessage({ command: 'register' });
                    }

                    function openProblem(index) {
                        vscode.postMessage({ command: 'openProblem', problemIndex: index });
                    }

                    function openStandings() {
                        vscode.postMessage({ command: 'openStandings' });
                    }
                </script>
            </body>
            </html>
        `;
    }

    // 渲染状态标签
    private renderStatusBadge(contest: IContestInfo, _status?: IContestStatus | null): string {
        let badgeText = '';
        let badgeColor = '';

        switch (contest.phase) {
            case ContestPhase.BEFORE:
                badgeText = 'Upcoming';
                badgeColor = '#4CAF50';
                break;
            case ContestPhase.CODING:
                badgeText = 'Running';
                badgeColor = '#2196F3';
                break;
            case ContestPhase.FINISHED:
                badgeText = 'Finished';
                badgeColor = '#9E9E9E';
                break;
            default:
                badgeText = contest.phase;
                badgeColor = '#757575';
        }

        return `
            <span class="status-badge" style="background-color: ${badgeColor}">
                ${badgeText}
            </span>
        `;
    }

    // 清理资源
    public dispose(): void {
        this.panels.forEach(panel => panel.dispose());
        this.panels.clear();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}

// 导出创建函数
export function createContestDetailWebview(context: vscode.ExtensionContext): ContestDetailWebview {
    return ContestDetailWebview.getInstance(context);
} 