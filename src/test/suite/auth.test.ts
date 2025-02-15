import * as assert from 'assert';
import * as vscode from 'vscode';
import { AuthManager, AuthStatus } from '../../auth/authManager';
import { codeforcesAPI } from '../../utils/api';

suite('Auth Test Suite', () => {
    let authManager: AuthManager;
    let context: vscode.ExtensionContext;

    setup(async () => {
        // 在每个测试前设置测试环境
        context = {
            subscriptions: [],
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            secrets: {
                get: () => Promise.resolve(undefined),
                store: () => Promise.resolve(),
                delete: () => Promise.resolve()
            }
        } as unknown as vscode.ExtensionContext;

        authManager = AuthManager.getInstance(context);
    });

    teardown(async () => {
        // 在每个测试后清理
        await authManager.logout();
    });

    test('Initial State Should Be NotLoggedIn', () => {
        assert.strictEqual(authManager.getStatus(), AuthStatus.NotLoggedIn);
    });

    test('Login Should Fail With Invalid Credentials', async () => {
        // 模拟用户输入
        const inputStub = {
            showInputBox: async () => 'invalid'
        };
        Object.assign(vscode.window, inputStub);

        const result = await authManager.login();
        assert.strictEqual(result, false);
        assert.strictEqual(authManager.getStatus(), AuthStatus.Error);
    });

    test('Login Should Succeed With Valid Credentials', async () => {
        // 模拟有效的用户输入
        const inputStub = {
            showInputBox: async () => 'valid_test_key'
        };
        Object.assign(vscode.window, inputStub);

        // 模拟API响应
        const apiStub = {
            validateCredentials: async () => true
        };
        Object.assign(codeforcesAPI, apiStub);

        const result = await authManager.login();
        assert.strictEqual(result, true);
        assert.strictEqual(authManager.getStatus(), AuthStatus.LoggedIn);
    });

    test('Logout Should Clear Credentials', async () => {
        // 先登录
        const inputStub = {
            showInputBox: async () => 'valid_test_key'
        };
        Object.assign(vscode.window, inputStub);
        await authManager.login();

        // 然后登出
        await authManager.logout();
        assert.strictEqual(authManager.getStatus(), AuthStatus.NotLoggedIn);
        assert.strictEqual(authManager.getCurrentUser(), null);
    });

    test('Status Change Should Emit Event', async () => {
        let emittedStatus: AuthStatus | undefined;
        authManager.onDidChangeStatus(status => {
            emittedStatus = status;
        });

        await authManager.login();
        assert.strictEqual(emittedStatus, AuthStatus.LoggedIn);
    });

    test('Credentials Should Be Stored Securely', async () => {
        let storedData: { [key: string]: string } = {};
        const secureStorageStub = {
            store: async (key: string, value: string) => {
                storedData[key] = value;
            },
            get: async (key: string) => storedData[key]
        };
        Object.assign(context.secrets, secureStorageStub);

        // 模拟登录
        const inputStub = {
            showInputBox: async () => 'test_key'
        };
        Object.assign(vscode.window, inputStub);
        await authManager.login();

        // 验证数据是否被正确存储
        assert.ok(Object.keys(storedData).length > 0);
        assert.ok(Object.values(storedData).every(value => typeof value === 'string'));
    });
}); 