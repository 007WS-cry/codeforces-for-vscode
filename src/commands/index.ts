import * as vscode from 'vscode';
import { registerContestCommands } from './contestCommands';

// 注册所有命令
export function registerCommands(context: vscode.ExtensionContext): void {
    // 注册竞赛相关命令
    registerContestCommands(context);

    // 注册帮助命令
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showHelp', () => {
            const helpContent = `
# Codeforces for VS Code

## Available Commands

### Contest Management
- \`Show Contest List\`: Display all available contests
- \`Show Upcoming Contests\`: Display contests that haven't started
- \`Show Active Contests\`: Display ongoing contests
- \`Register for Contest\`: Register for a specific contest
- \`Refresh Contests\`: Update the contest list

### Problem Management
- \`Show Problem List\`: Display problems for a specific contest
- \`Open Problem\`: Open a problem in browser
- \`Submit Solution\`: Submit your solution to Codeforces

### Other
- \`Clear Notifications\`: Clear all notification history
- \`Show Help\`: Display this help information

## Keyboard Shortcuts
You can set custom keyboard shortcuts for any of these commands in VS Code's keyboard shortcuts settings.
            `;

            // 创建并显示帮助 Webview
            const panel = vscode.window.createWebviewPanel(
                'codeforcesHelp',
                'Codeforces Help',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = `
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
                        h1 {
                            border-bottom: 1px solid var(--vscode-panel-border);
                            padding-bottom: 10px;
                        }
                        h2 {
                            margin-top: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        h3 {
                            color: var(--vscode-textPreformat-foreground);
                        }
                        code {
                            background: var(--vscode-textCodeBlock-background);
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                        ul {
                            padding-left: 20px;
                        }
                        li {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    ${new vscode.MarkdownString(helpContent).value}
                </body>
                </html>
            `;
        })
    );

    // 注册快速命令面板
    context.subscriptions.push(
        vscode.commands.registerCommand('codeforces.showCommandPalette', async () => {
            const commands = [
                {
                    label: 'Show Contest List',
                    description: 'Display all available contests',
                    command: 'codeforces.showContestList'
                },
                {
                    label: 'Show Upcoming Contests',
                    description: 'Display contests that haven\'t started',
                    command: 'codeforces.showUpcomingContests'
                },
                {
                    label: 'Show Active Contests',
                    description: 'Display ongoing contests',
                    command: 'codeforces.showActiveContests'
                },
                {
                    label: 'Refresh Contests',
                    description: 'Update the contest list',
                    command: 'codeforces.refreshContests'
                },
                {
                    label: 'Clear Notifications',
                    description: 'Clear all notification history',
                    command: 'codeforces.clearNotifications'
                },
                {
                    label: 'Show Help',
                    description: 'Display help information',
                    command: 'codeforces.showHelp'
                }
            ];

            const selected = await vscode.window.showQuickPick(commands, {
                placeHolder: 'Select a Codeforces command'
            });

            if (selected) {
                await vscode.commands.executeCommand(selected.command);
            }
        })
    );
}

// 导出所有命令 ID，用于 package.json 中的 contributes.commands
export const commandIds = [
    'codeforces.showContestList',
    'codeforces.showContestDetail',
    'codeforces.showProblemList',
    'codeforces.registerContest',
    'codeforces.refreshContests',
    'codeforces.showUpcomingContests',
    'codeforces.showActiveContests',
    'codeforces.openContestPage',
    'codeforces.clearNotifications',
    'codeforces.showHelp',
    'codeforces.showCommandPalette'
]; 