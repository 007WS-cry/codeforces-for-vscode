import * as vscode from 'vscode';
import { ContestManager } from '../contest/contestManager';
import { IContestInfo, ContestPhase } from '../types';
import { notificationManager } from '../notification/notificationManager';
import { codeforcesAPI } from '../utils/api';

interface ProblemInfo {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points?: number;
    rating?: number;
    tags: string[];
    solved?: boolean;
}

export class ProblemListWebview {
    private static instance: ProblemListWebview;
    private panel: vscode.WebviewPanel | undefined;
    private contestManager: ContestManager;
    private disposables: vscode.Disposable[] = [];
    private currentContestId: number | undefined;

    private constructor(private context: vscode.ExtensionContext) {
        this.contestManager = ContestManager.getInstance(context);
    }

    public static getInstance(context: vscode.ExtensionContext): ProblemListWebview {
        if (!ProblemListWebview.instance) {
            ProblemListWebview.instance = new ProblemListWebview(context);
        }
        return ProblemListWebview.instance;
    }

    // 显示竞赛题目列表
    public async show(contestId: number): Promise<void> {
        this.currentContestId = contestId;
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this.panel) {
            this.panel.reveal(columnToShowIn);
            return;
        }

        try {
            const contest = await this.getContestInfo(contestId);
            if (!contest) {
                notificationManager.showError('Contest not found');
                return;
            }

            this.panel = vscode.window.createWebviewPanel(
                'codeforcesProblemList',
                `Problems: ${contest.name}`,
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

            // 注册消息处理
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

        } catch (error) {
            notificationManager.showError(`Failed to open problem list: ${error}`);
        }
    }

    // 更新视图
    private async updateView(): Promise<void> {
        if (!this.panel || !this.currentContestId) {
            return;
        }

        try {
            const contest = await this.getContestInfo(this.currentContestId);
            const problems = await this.getProblems(this.currentContestId);
            if (contest && problems) {
                this.panel.webview.html = this.getWebviewContent(contest, problems);
            }
        } catch (error) {
            notificationManager.showError(`Failed to update problem list: ${error}`);
        }
    }

    // 获取竞赛信息
    private async getContestInfo(contestId: number): Promise<IContestInfo | undefined> {
        const contests = await this.contestManager.getContests();
        return contests.find(c => c.id === contestId);
    }

    // 获取题目列表
    private async getProblems(contestId: number): Promise<ProblemInfo[]> {
        try {
            const response = await codeforcesAPI.getProblemList();
            return response.result.problems
                .filter((p: { contestId: number; }) => p.contestId === contestId)
                .map((p: { contestId: any; index: any; name: any; type: any; points: any; rating: any; tags: any; }) => ({
                    contestId: p.contestId,
                    index: p.index,
                    name: p.name,
                    type: p.type,
                    points: p.points,
                    rating: p.rating,
                    tags: p.tags,
                    solved: false // TODO: 实现题目状态追踪
                }));
        } catch (error) {
            console.error('Failed to get problems:', error);
            return [];
        }
    }

    // 处理 Webview 消息
    private async handleMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'refresh':
                await this.updateView();
                break;
            case 'openProblem':
                this.openProblemPage(message.contestId, message.problemIndex);
                break;
            case 'submit':
                this.openSubmitPage(message.contestId, message.problemIndex);
                break;
        }
    }

    // 打开题目页面
    private openProblemPage(contestId: number, problemIndex: string): void {
        const url = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    // 打开提交页面
    private openSubmitPage(contestId: number, problemIndex: string): void {
        const url = `https://codeforces.com/contest/${contestId}/submit/${problemIndex}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    // 生成 Webview 内容
    private getWebviewContent(contest: IContestInfo, problems: ProblemInfo[]): string {
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
                    .problem-list {
                        display: grid;
                        gap: 15px;
                    }
                    .problem-card {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        padding: 15px;
                        border-radius: 4px;
                    }
                    .problem-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .problem-title {
                        font-size: 16px;
                        font-weight: bold;
                    }
                    .problem-index {
                        font-size: 14px;
                        color: var(--vscode-textPreformat-foreground);
                    }
                    .problem-info {
                        font-size: 14px;
                        margin: 5px 0;
                    }
                    .problem-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5px;
                        margin-top: 10px;
                    }
                    .tag {
                        background: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 12px;
                    }
                    .actions {
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
                    .solved {
                        border-left: 4px solid #4CAF50;
                    }
                </style>
            </head>
            <body>
                <button class="refresh-button" onclick="refresh()">Refresh</button>

                <div class="header">
                    <h1>${contest.name} - Problems</h1>
                    ${contest.phase === ContestPhase.CODING ? '<span class="tag">Contest is running</span>' : ''}
                </div>

                <div class="problem-list">
                    ${problems.map(problem => `
                        <div class="problem-card ${problem.solved ? 'solved' : ''}">
                            <div class="problem-header">
                                <span class="problem-index">${problem.index}</span>
                                <span class="problem-title">${problem.name}</span>
                            </div>
                            ${problem.points ? `
                                <div class="problem-info">Points: ${problem.points}</div>
                            ` : ''}
                            ${problem.rating ? `
                                <div class="problem-info">Rating: ${problem.rating}</div>
                            ` : ''}
                            <div class="problem-tags">
                                ${problem.tags.map(tag => `
                                    <span class="tag">${tag}</span>
                                `).join('')}
                            </div>
                            <div class="actions">
                                <button onclick="openProblem(${problem.contestId}, '${problem.index}')">
                                    Open Problem
                                </button>
                                <button onclick="submit(${problem.contestId}, '${problem.index}')">
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    function openProblem(contestId, index) {
                        vscode.postMessage({ 
                            command: 'openProblem',
                            contestId: contestId,
                            problemIndex: index
                        });
                    }

                    function submit(contestId, index) {
                        vscode.postMessage({ 
                            command: 'submit',
                            contestId: contestId,
                            problemIndex: index
                        });
                    }
                </script>
            </body>
            </html>
        `;
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
export function createProblemListWebview(context: vscode.ExtensionContext): ProblemListWebview {
    return ProblemListWebview.getInstance(context);
} 