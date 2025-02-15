import * as vscode from 'vscode';
import { ContestManager } from '../contest/contestManager';
import { IContestInfo, ContestPhase } from '../types';
import { notificationManager } from '../notification/notificationManager';

export class ContestListWebview {
    private static instance: ContestListWebview;
    private panel: vscode.WebviewPanel | undefined;
    private contestManager: ContestManager;
    private disposables: vscode.Disposable[] = [];

    private constructor(private context: vscode.ExtensionContext) {
        this.contestManager = ContestManager.getInstance(context);
        
        // 监听竞赛列表变更
        this.disposables.push(
            this.contestManager.onDidChangeContests(() => {
                this.updateView();
            })
        );
    }

    public static getInstance(context: vscode.ExtensionContext): ContestListWebview {
        if (!ContestListWebview.instance) {
            ContestListWebview.instance = new ContestListWebview(context);
        }
        return ContestListWebview.instance;
    }

    // 显示竞赛列表
    public async show(): Promise<void> {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this.panel) {
            this.panel.reveal(columnToShowIn);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'codeforcesContests',
            'Codeforces Contests',
            columnToShowIn || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        this.panel.iconPath = vscode.Uri.joinPath(
            this.context.extensionUri,
            'media',
            'codeforces.png'
        );

        // 注册 Webview 消息处理
        this.panel.webview.onDidReceiveMessage(
            this.handleMessage.bind(this),
            null,
            this.disposables
        );

        // 监听面板关闭
        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            this.disposables
        );

        await this.updateView();
    }

    // 更新视图内容
    private async updateView(): Promise<void> {
        if (!this.panel) {
            return;
        }

        try {
            const contests = await this.contestManager.getContests(true);
            this.panel.webview.html = this.getWebviewContent(contests);
        } catch (error) {
            notificationManager.showError(`Failed to update contest list: ${error}`);
        }
    }

    // 处理 Webview 消息
    private async handleMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'refresh':
                await this.updateView();
                break;
            case 'register':
                await this.handleRegistration(message.contestId);
                break;
            case 'openContest':
                this.openContestPage(message.contestId);
                break;
        }
    }

    // 处理竞赛注册
    private async handleRegistration(contestId: number): Promise<void> {
        try {
            const success = await this.contestManager.registerForContest(contestId);
            if (success) {
                notificationManager.showInfo('Successfully registered for contest');
                await this.updateView();
            } else {
                notificationManager.showError('Failed to register for contest');
            }
        } catch (error) {
            notificationManager.showError(`Registration failed: ${error}`);
        }
    }

    // 打开竞赛页面
    private openContestPage(contestId: number): void {
        const url = `https://codeforces.com/contest/${contestId}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    // 生成 Webview 内容
    private getWebviewContent(contests: IContestInfo[]): string {
        const upcoming = contests.filter(c => c.phase === ContestPhase.BEFORE);
        const ongoing = contests.filter(c => c.phase === ContestPhase.CODING);
        const finished = contests.filter(c => c.phase === ContestPhase.FINISHED);

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
                    .contest-section {
                        margin-bottom: 30px;
                    }
                    .contest-card {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        margin: 10px 0;
                        padding: 15px;
                        border-radius: 4px;
                    }
                    .contest-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .contest-info {
                        font-size: 14px;
                        margin: 5px 0;
                    }
                    .contest-actions {
                        margin-top: 10px;
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

                <div class="contest-section">
                    <h2>Upcoming Contests (${upcoming.length})</h2>
                    ${this.renderContestList(upcoming)}
                </div>

                <div class="contest-section">
                    <h2>Ongoing Contests (${ongoing.length})</h2>
                    ${this.renderContestList(ongoing)}
                </div>

                <div class="contest-section">
                    <h2>Finished Contests (${finished.length})</h2>
                    ${this.renderContestList(finished)}
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    function register(contestId) {
                        vscode.postMessage({ command: 'register', contestId });
                    }

                    function openContest(contestId) {
                        vscode.postMessage({ command: 'openContest', contestId });
                    }
                </script>
            </body>
            </html>
        `;
    }

    // 渲染竞赛列表
    private renderContestList(contests: IContestInfo[]): string {
        return contests.map(contest => `
            <div class="contest-card">
                <div class="contest-title">${contest.name}</div>
                <div class="contest-info">Type: ${contest.type}</div>
                <div class="contest-info">Duration: ${Math.floor(contest.durationSeconds / 3600)} hours</div>
                ${contest.startTimeSeconds ? `
                    <div class="contest-info">
                        Start Time: ${new Date(contest.startTimeSeconds * 1000).toLocaleString()}
                    </div>
                ` : ''}
                <div class="contest-actions">
                    <button onclick="openContest(${contest.id})">Open</button>
                    ${contest.phase === ContestPhase.BEFORE ? `
                        <button onclick="register(${contest.id})">Register</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // 清理资源
    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}

// 导出创建函数
export function createContestListWebview(context: vscode.ExtensionContext): ContestListWebview {
    return ContestListWebview.getInstance(context);
} 