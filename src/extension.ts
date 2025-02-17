// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AuthManager } from './auth/authManager';
import { ContestManager } from './contest/contestManager';
import { TestCaseManager } from './testcases/manager';
import { DifficultyManager } from './difficulty/manager';
import { DifficultyDisplay } from './difficulty/display';
import { CodeExecutor } from './runner/executor';
import { OutputValidator } from './runner/validator';
import { TestCase as ValidatorTestCase } from './runner/validator';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Codeforces for VSCode is now active!');

	// 初始化各个管理器
	const authManager = AuthManager.getInstance(context);
	const contestManager = ContestManager.getInstance(context);
	const testCaseManager = new TestCaseManager(context);
	const difficultyManager = DifficultyManager.getInstance(context);
	const difficultyDisplay = DifficultyDisplay.getInstance(context);
	const codeExecutor = CodeExecutor.getInstance(context);
	const outputValidator = OutputValidator.getInstance(context);

	// 初始化测试用例存储
	testCaseManager.initialize();

	// 注册所有命令
	let disposables = [
		// 认证相关命令
		vscode.commands.registerCommand('codeforces-for-vscode.login', () => {
			authManager.login();
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.logout', () => {
			authManager.logout();
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.checkStatus', () => {
			const status = authManager.getStatus();
			vscode.window.showInformationMessage(`Current status: ${status}`);
		}),

		// 竞赛相关命令
		vscode.commands.registerCommand('codeforces-for-vscode.showContestList', () => {
			contestManager.showContestList();
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.showProblemList', async (contestId: number) => {
			await contestManager.showProblemList(contestId);
		}),

		// 测试用例相关命令
		vscode.commands.registerCommand('codeforces-for-vscode.runTestCase', async (filePath: string, input: string) => {
			const result = await codeExecutor.compileAndRun(filePath, input);
			if (result.success) {
				vscode.window.showInformationMessage('Test case executed successfully');
			} else {
				vscode.window.showErrorMessage(`Test case failed: ${result.error}`);
			}
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.validateTestCases', async (filePath: string, contestId: number, problemIndex: string) => {
			const testCases = await testCaseManager.getTestCases(contestId, problemIndex);
			// 转换测试用例类型
			const validatorTestCases: ValidatorTestCase[] = testCases.map(tc => ({
				input: tc.input,
				expectedOutput: tc.output // 假设manager的TestCase中使用output而不是expectedOutput
			}));
			
			const results = await outputValidator.validateMultipleTestCases(filePath, validatorTestCases);
			
			// 显示测试结果
			const passedCount = results.filter(r => r.passed).length;
			vscode.window.showInformationMessage(
				`Test Results: ${passedCount}/${results.length} passed`
			);
		}),

		// 难度相关命令
		vscode.commands.registerCommand('codeforces-for-vscode.showDifficulty', (rating: number) => {
			difficultyDisplay.showDifficultyInStatusBar(rating);
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.showDifficultyTrend', (ratings: number[]) => {
			const trend = difficultyManager.getDifficultyTrend(ratings);
			vscode.window.showInformationMessage(
				`Difficulty Trend: ${trend.trend} (${trend.change > 0 ? '+' : ''}${trend.change})`
			);
		}),

		// 设置相关命令
		vscode.commands.registerCommand('codeforces-for-vscode.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'codeforces-for-vscode');
		}),

		vscode.commands.registerCommand('codeforces-for-vscode.resetSettings', async () => {
			// 重置所有设置
			await authManager.logout();
			await testCaseManager.clearTestCases(0, '');
			vscode.window.showInformationMessage('All settings have been reset');
		})
	];

	// 注册状态栏项
	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);
	statusBarItem.text = "$(symbol-event) Codeforces";
	statusBarItem.command = 'codeforces-for-vscode.showContestList';
	statusBarItem.show();
	disposables.push(statusBarItem);

	// 将所有命令和资源添加到订阅列表
	context.subscriptions.push(...disposables);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 清理资源
	console.log('Codeforces for VSCode is deactivating...');
}
