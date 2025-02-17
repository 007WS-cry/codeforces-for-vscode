import * as vscode from 'vscode';

export interface APIConfig {
    key: string;
    secret: string;
}

export interface AuthConfig {
    autoLogin: boolean;
    rememberMe: boolean;
}

export interface NetworkConfig {
    timeout: number;
    proxy: {
        enabled: boolean;
        url: string;
    };
}

export interface NotificationConfig {
    enabled: boolean;
    duration: number;
}

export interface ContestConfig {
    autoRefresh: boolean;
    refreshInterval: number;
    notifications: {
        enabled: boolean;
        beforeStart: number[];
        beforeEnd: number[];
        statusChange: boolean;
        rankingChange: boolean;
    };
    cache: {
        maxAge: number;
    };
}

export class Configuration {
    private static instance: Configuration;
    private config: vscode.WorkspaceConfiguration;

    private constructor() {
        this.config = vscode.workspace.getConfiguration('codeforces-for-vscode');
    }

    public static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    /**
     * 获取API配置
     */
    public getAPIConfig(): APIConfig {
        return {
            key: this.config.get<string>('api.key', ''),
            secret: this.config.get<string>('api.secret', '')
        };
    }

    /**
     * 获取认证配置
     */
    public getAuthConfig(): AuthConfig {
        return {
            autoLogin: this.config.get<boolean>('auth.autoLogin', false),
            rememberMe: this.config.get<boolean>('auth.rememberMe', true)
        };
    }

    /**
     * 获取网络配置
     */
    public getNetworkConfig(): NetworkConfig {
        return {
            timeout: this.config.get<number>('network.timeout', 10000),
            proxy: {
                enabled: this.config.get<boolean>('network.proxy.enabled', false),
                url: this.config.get<string>('network.proxy.url', '')
            }
        };
    }

    /**
     * 获取通知配置
     */
    public getNotificationConfig(): NotificationConfig {
        return {
            enabled: this.config.get<boolean>('notifications.enabled', true),
            duration: this.config.get<number>('notifications.duration', 5000)
        };
    }

    /**
     * 获取竞赛配置
     */
    public getContestConfig(): ContestConfig {
        return {
            autoRefresh: this.config.get<boolean>('contest.autoRefresh', true),
            refreshInterval: this.config.get<number>('contest.refreshInterval', 300),
            notifications: {
                enabled: this.config.get<boolean>('contest.notifications.enabled', true),
                beforeStart: this.config.get<number[]>('contest.notifications.beforeStart', [15, 5, 1]),
                beforeEnd: this.config.get<number[]>('contest.notifications.beforeEnd', [15, 5, 1]),
                statusChange: this.config.get<boolean>('contest.notifications.statusChange', true),
                rankingChange: this.config.get<boolean>('contest.notifications.rankingChange', true)
            },
            cache: {
                maxAge: this.config.get<number>('contest.cache.maxAge', 600)
            }
        };
    }

    /**
     * 更新配置
     */
    public async updateConfig<T>(section: string, value: T): Promise<void> {
        try {
            await this.config.update(section, value, true);
            this.config = vscode.workspace.getConfiguration('codeforces-for-vscode');
        } catch (error) {
            throw new Error(`Failed to update configuration: ${error}`);
        }
    }

    /**
     * 重置配置
     */
    public async resetConfig(): Promise<void> {
        const sections = [
            'api',
            'auth',
            'network',
            'notifications',
            'contest'
        ];

        try {
            for (const section of sections) {
                await this.config.update(section, undefined, true);
            }
            this.config = vscode.workspace.getConfiguration('codeforces-for-vscode');
        } catch (error) {
            throw new Error(`Failed to reset configuration: ${error}`);
        }
    }

    /**
     * 监听配置变更
     */
    public onConfigChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('codeforces-for-vscode')) {
                this.config = vscode.workspace.getConfiguration('codeforces-for-vscode');
                callback(e);
            }
        });
    }
}

// 导出单例实例
export const configuration = Configuration.getInstance(); 