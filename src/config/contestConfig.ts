import * as vscode from 'vscode';

export interface IContestNotificationConfig {
    enabled: boolean;
    beforeStart: number[];
    beforeEnd: number[];
    statusChange: boolean;
    rankingChange: boolean;
}

export interface IContestCacheConfig {
    maxAge: number;
}

export interface IContestConfig {
    autoRefresh: boolean;
    refreshInterval: number;
    notifications: IContestNotificationConfig;
    cache: IContestCacheConfig;
}

export class ContestConfig {
    private static instance: ContestConfig;
    private config: vscode.WorkspaceConfiguration;

    private constructor() {
        this.config = vscode.workspace.getConfiguration('codeforces-for-vscode.contest');
    }

    public static getInstance(): ContestConfig {
        if (!ContestConfig.instance) {
            ContestConfig.instance = new ContestConfig();
        }
        return ContestConfig.instance;
    }

    // 获取完整配置
    public getConfig(): IContestConfig {
        return {
            autoRefresh: this.getAutoRefresh(),
            refreshInterval: this.getRefreshInterval(),
            notifications: this.getNotificationConfig(),
            cache: this.getCacheConfig()
        };
    }

    // 获取自动刷新设置
    public getAutoRefresh(): boolean {
        return this.config.get<boolean>('autoRefresh', true);
    }

    // 获取刷新间隔
    public getRefreshInterval(): number {
        return this.config.get<number>('refreshInterval', 300);
    }

    // 获取通知配置
    public getNotificationConfig(): IContestNotificationConfig {
        const defaultConfig: IContestNotificationConfig = {
            enabled: true,
            beforeStart: [15, 5, 1],
            beforeEnd: [15, 5, 1],
            statusChange: true,
            rankingChange: true
        };

        return {
            enabled: this.config.get<boolean>('notifications.enabled', defaultConfig.enabled),
            beforeStart: this.config.get<number[]>('notifications.beforeStart', defaultConfig.beforeStart),
            beforeEnd: this.config.get<number[]>('notifications.beforeEnd', defaultConfig.beforeEnd),
            statusChange: this.config.get<boolean>('notifications.statusChange', defaultConfig.statusChange),
            rankingChange: this.config.get<boolean>('notifications.rankingChange', defaultConfig.rankingChange)
        };
    }

    // 获取缓存配置
    public getCacheConfig(): IContestCacheConfig {
        const defaultConfig: IContestCacheConfig = {
            maxAge: 600
        };

        return {
            maxAge: this.config.get<number>('cache.maxAge', defaultConfig.maxAge)
        };
    }

    // 更新配置
    public async updateConfig(config: Partial<IContestConfig>): Promise<void> {
        try {
            if (config.autoRefresh !== undefined) {
                await this.config.update('autoRefresh', config.autoRefresh, true);
            }
            if (config.refreshInterval !== undefined) {
                await this.config.update('refreshInterval', config.refreshInterval, true);
            }
            if (config.notifications) {
                const notifications = config.notifications;
                if (notifications.enabled !== undefined) {
                    await this.config.update('notifications.enabled', notifications.enabled, true);
                }
                if (notifications.beforeStart !== undefined) {
                    await this.config.update('notifications.beforeStart', notifications.beforeStart, true);
                }
                if (notifications.beforeEnd !== undefined) {
                    await this.config.update('notifications.beforeEnd', notifications.beforeEnd, true);
                }
                if (notifications.statusChange !== undefined) {
                    await this.config.update('notifications.statusChange', notifications.statusChange, true);
                }
                if (notifications.rankingChange !== undefined) {
                    await this.config.update('notifications.rankingChange', notifications.rankingChange, true);
                }
            }
            if (config.cache) {
                if (config.cache.maxAge !== undefined) {
                    await this.config.update('cache.maxAge', config.cache.maxAge, true);
                }
            }
        } catch (error) {
            throw new Error(`Failed to update contest config: ${error}`);
        }
    }

    // 重置配置
    public async resetConfig(): Promise<void> {
        try {
            await this.config.update('autoRefresh', undefined, true);
            await this.config.update('refreshInterval', undefined, true);
            await this.config.update('notifications', undefined, true);
            await this.config.update('cache', undefined, true);
        } catch (error) {
            throw new Error(`Failed to reset contest config: ${error}`);
        }
    }

    // 监听配置变更
    public onConfigChange(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('codeforces-for-vscode.contest')) {
                this.config = vscode.workspace.getConfiguration('codeforces-for-vscode.contest');
                callback();
            }
        });
    }
}

// 导出单例实例
export const contestConfig = ContestConfig.getInstance(); 