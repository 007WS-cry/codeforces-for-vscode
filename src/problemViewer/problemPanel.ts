import * as vscode from 'vscode';
import { ProblemData, MessageType, WebviewMessage } from './types';
import { getNonce } from '../utils';
import { ContentHandler } from './contentHandler';

export class ProblemPanel {
    public static currentPanel: ProblemPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // 设置面板标题
        this._panel.title = "Problem Viewer";

        // 初始化 WebView 内容
        this._panel.webview.html = this._getWebviewContent();
        
        // 设置消息监听器
        this._setWebviewMessageListener(this._panel.webview);

        // 监听主题变化
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        
        vscode.window.onDidChangeActiveColorTheme(
            () => {
                this._panel.webview.postMessage({
                    type: MessageType.THEME_CHANGED,
                    data: { theme: vscode.window.activeColorTheme.kind }
                });
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : vscode.ViewColumn.One;

        if (ProblemPanel.currentPanel) {
            ProblemPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'problemViewer',
            'Problem Viewer',
            column ?? vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'resources', 'webview')
                ]
            }
        );

        ProblemPanel.currentPanel = new ProblemPanel(panel, extensionUri);
    }

    public async updateProblem(problem: ProblemData) {
        // 显示加载状态
        await this._panel.webview.postMessage({
            type: MessageType.UPDATE_CONTENT,
            data: {
                isLoading: true
            }
        });

        try {
            // 处理问题内容
            const processedContent = ContentHandler.processProblemContent(problem);
            
            // 更新内容
            await this._panel.webview.postMessage({
                type: MessageType.UPDATE_CONTENT,
                data: {
                    isLoading: false,
                    content: processedContent,
                    problem: problem
                }
            });
        } catch (error) {
            // 错误处理
            await this._panel.webview.postMessage({
                type: MessageType.ERROR,
                data: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                }
            });
        }
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (message: WebviewMessage) => {
                switch (message.type) {
                    case MessageType.COPY_SAMPLE:
                        await vscode.env.clipboard.writeText(message.data.text);
                        vscode.window.showInformationMessage('Sample copied to clipboard');
                        break;
                    case MessageType.ERROR:
                        vscode.window.showErrorMessage(message.data.message);
                        break;
                }
            },
            undefined,
            this._disposables
        );
    }

    private _getWebviewContent() {
        const webview = this._panel.webview;
        const nonce = getNonce();

        // 获取资源 URI
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'resources', 'webview', 'problem', 'main.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'resources', 'webview', 'problem', 'styles.css')
        );

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}' https://cdnjs.cloudflare.com; connect-src https:; img-src ${webview.cspSource} https:;">
                <link rel="stylesheet" href="${styleUri}">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS_HTML" nonce="${nonce}"></script>
                <title>Problem Viewer</title>
            </head>
            <body>
                <div id="loading" class="loading-container">
                    <div class="loader"></div>
                    <div class="loading-text">Loading problem...</div>
                </div>
                <div id="error" class="error-container"></div>
                <div id="content" class="content-container">
                    <div id="problem-header" class="problem-header"></div>
                    <div id="problem-content" class="problem-content"></div>
                    <div id="problem-samples" class="problem-samples"></div>
                    <div id="problem-note" class="problem-note"></div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    public dispose() {
        ProblemPanel.currentPanel = undefined;

        // 清理资源
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
