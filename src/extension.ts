// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Codeforces for VSCode is now active!');

	// 注册所有命令
	let disposables = [
		vscode.commands.registerCommand('codeforces-for-vscode.login', () => {
			vscode.window.showInformationMessage('Login command triggered');
			// TODO: 实现登录逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.logout', () => {
			vscode.window.showInformationMessage('Logout command triggered');
			// TODO: 实现登出逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.checkStatus', () => {
			vscode.window.showInformationMessage('Checking login status...');
			// TODO: 实现状态检查逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.switchAccount', () => {
			vscode.window.showInformationMessage('Switch account command triggered');
			// TODO: 实现账号切换逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.setApiKey', () => {
			vscode.window.showInformationMessage('Set API key command triggered');
			// TODO: 实现API密钥设置逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.resetApiKey', () => {
			vscode.window.showInformationMessage('Reset API key command triggered');
			// TODO: 实现API密钥重置逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.validateApiKey', () => {
			vscode.window.showInformationMessage('Validating API key...');
			// TODO: 实现API密钥验证逻辑
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'codeforces-for-vscode');
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.resetSettings', () => {
			vscode.window.showInformationMessage('Reset settings command triggered');
			// TODO: 实现设置重置逻辑
		})
	];

	// 将所有命令添加到订阅列表
	context.subscriptions.push(...disposables);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// TODO: 清理资源
}
