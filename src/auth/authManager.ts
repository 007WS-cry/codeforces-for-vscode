import * as vscode from 'vscode';
import { EventEmitter } from 'vscode';

// 定义登录状态类型
export enum AuthStatus {
    NotLoggedIn = 'NotLoggedIn',
    LoggedIn = 'LoggedIn',
    LoggingIn = 'LoggingIn',
    Error = 'Error'
}

// 定义用户信息接口
export interface UserInfo {
    handle: string;
    apiKey: string;
    apiSecret: string;
}

export class AuthManager {
    private static instance: AuthManager;
    private context: vscode.ExtensionContext;
    private currentStatus: AuthStatus = AuthStatus.NotLoggedIn;
    private currentUser: UserInfo | null = null;

    // 状态变化事件
    private readonly _onDidChangeStatus = new EventEmitter<AuthStatus>();
    public readonly onDidChangeStatus = this._onDidChangeStatus.event;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.init();
    }

    // 单例模式获取实例
    public static getInstance(context: vscode.ExtensionContext): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager(context);
        }
        return AuthManager.instance;
    }

    // 初始化
    private async init() {
        // 尝试恢复之前的登录状态
        const savedUser = await this.context.secrets.get('userInfo');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                await this.validateCredentials();
            } catch (error) {
                console.error('Failed to restore login state:', error);
                await this.logout();
            }
        }
    }

    // 获取当前状态
    public getStatus(): AuthStatus {
        return this.currentStatus;
    }

    // 获取当前用户
    public getCurrentUser(): UserInfo | null {
        return this.currentUser;
    }

    // 登录
    public async login(): Promise<boolean> {
        try {
            this.setStatus(AuthStatus.LoggingIn);

            // 获取API密钥
            const apiKey = await vscode.window.showInputBox({
                prompt: '请输入Codeforces API Key',
                password: true
            });

            if (!apiKey) {
                throw new Error('API Key is required');
            }

            // 获取API密钥的密钥
            const apiSecret = await vscode.window.showInputBox({
                prompt: '请输入Codeforces API Secret',
                password: true
            });

            if (!apiSecret) {
                throw new Error('API Secret is required');
            }

            // 获取用户句柄
            const handle = await vscode.window.showInputBox({
                prompt: '请输入Codeforces Handle',
                validateInput: (value) => {
                    return value ? null : 'Handle is required';
                }
            });

            if (!handle) {
                throw new Error('Handle is required');
            }

            // 创建用户信息
            const userInfo: UserInfo = {
                handle,
                apiKey,
                apiSecret
            };

            // 验证凭证
            await this.validateCredentials(userInfo);

            // 保存用户信息
            await this.context.secrets.store('userInfo', JSON.stringify(userInfo));
            this.currentUser = userInfo;
            this.setStatus(AuthStatus.LoggedIn);

            vscode.window.showInformationMessage(`Successfully logged in as ${handle}`);
            return true;

        } catch (error) {
            this.setStatus(AuthStatus.Error);
            vscode.window.showErrorMessage(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    // 登出
    public async logout(): Promise<void> {
        try {
            await this.context.secrets.delete('userInfo');
            this.currentUser = null;
            this.setStatus(AuthStatus.NotLoggedIn);
            vscode.window.showInformationMessage('Successfully logged out');
        } catch (error) {
            vscode.window.showErrorMessage('Logout failed');
            throw error;
        }
    }

    // 验证凭证
    private async validateCredentials(userInfo?: UserInfo): Promise<boolean> {
        try {
            const info = userInfo || this.currentUser;
            if (!info) {
                throw new Error('No credentials to validate');
            }

            // TODO: 实现实际的API验证
            // 这里需要调用Codeforces API进行验证
            // 暂时返回true，等待API实现
            return true;

        } catch (error) {
            this.setStatus(AuthStatus.Error);
            throw error;
        }
    }

    // 设置状态
    private setStatus(status: AuthStatus) {
        this.currentStatus = status;
        this._onDidChangeStatus.fire(status);
    }

    // 重置设置
    public async resetSettings(): Promise<void> {
        try {
            await this.logout();
            // 可以添加其他重置逻辑
            vscode.window.showInformationMessage('Settings have been reset');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to reset settings');
            throw error;
        }
    }
} 