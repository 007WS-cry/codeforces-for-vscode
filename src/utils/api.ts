import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { IContestInfo, IContestStatus, IContestRanking } from '../types';

export class CodeforcesAPI {
    private static instance: CodeforcesAPI;
    private axiosInstance: AxiosInstance;
    private apiKey: string = '';
    private apiSecret: string = '';

    private constructor() {
        // 创建axios实例
        this.axiosInstance = axios.create({
            baseURL: 'https://codeforces.com/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 添加响应拦截器
        this.axiosInstance.interceptors.response.use(
            response => response.data,
            error => this.handleError(error)
        );
    }

    // 单例模式获取实例
    public static getInstance(): CodeforcesAPI {
        if (!CodeforcesAPI.instance) {
            CodeforcesAPI.instance = new CodeforcesAPI();
        }
        return CodeforcesAPI.instance;
    }

    // 设置API凭证
    public setCredentials(apiKey: string, apiSecret: string): void {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    // 生成API签名
    private generateApiSignature(methodName: string, params: Record<string, string>): string {
        const rand = Math.floor(Math.random() * 900000) + 100000;
        const time = Math.floor(Date.now() / 1000);
        
        // 添加必要参数
        params.apiKey = this.apiKey;
        params.time = time.toString();

        // 按参数名排序
        const sortedParams = Object.entries(params)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        // 生成签名字符串
        const signatureString = `${rand}/${methodName}?${sortedParams}#${this.apiSecret}`;
        
        // 计算SHA512哈希
        return crypto.createHash('sha512')
            .update(signatureString)
            .digest('hex');
    }

    // 发送API请求
    private async makeRequest(
        methodName: string,
        params: Record<string, string> = {},
        requireAuth: boolean = true
    ): Promise<any> {
        try {
            if (requireAuth && (!this.apiKey || !this.apiSecret)) {
                throw new Error('API credentials not set');
            }

            // 生成签名
            if (requireAuth) {
                const apiSig = this.generateApiSignature(methodName, params);
                params.apiSig = apiSig;
            }

            // 发送请求
            const response = await this.axiosInstance.get(`/${methodName}`, { params });
            return response;

        } catch (error) {
            throw this.handleError(error);
        }
    }

    // 错误处理
    private handleError(error: any): never {
        let message = 'Unknown error occurred';

        if (axios.isAxiosError(error)) {
            if (error.response) {
                // API返回的错误
                message = `API Error: ${error.response.data.comment || error.response.data.message || error.message}`;
            } else if (error.request) {
                // 请求未收到响应
                message = 'No response from Codeforces server';
            } else {
                // 请求配置错误
                message = `Request Error: ${error.message}`;
            }
        } else if (error instanceof Error) {
            message = error.message;
        }

        // 显示错误消息
        vscode.window.showErrorMessage(message);
        throw new Error(message);
    }

    // API方法

    // 验证用户凭证
    public async validateCredentials(handle: string): Promise<boolean> {
        try {
            const response = await this.makeRequest('user.info', { handles: handle });
            return Array.isArray(response.result) && response.result.length > 0;
        } catch (error) {
            return false;
        }
    }

    // 获取用户信息
    public async getUserInfo(handle: string): Promise<any> {
        return this.makeRequest('user.info', { handles: handle }, false);
    }

    // 获取比赛列表
    public async getContestList(): Promise<IContestInfo[]> {
        const response = await this.makeRequest('contest.list', {}, false);
        return response.result;
    }

    // 获取题目列表
    public async getProblemList(): Promise<any> {
        return this.makeRequest('problemset.problems', {}, false);
    }

    // 获取比赛详细信息
    public async getContestStandings(
        contestId: number,
        from?: number,
        count?: number,
        handles?: string[]
    ): Promise<{
        contest: IContestInfo;
        problems: any[];
        rows: IContestRanking[];
    }> {
        const params: Record<string, string> = {
            contestId: contestId.toString()
        };

        if (from !== undefined) {
            params.from = from.toString();
        }
        if (count !== undefined) {
            params.count = count.toString();
        }
        if (handles && handles.length > 0) {
            params.handles = handles.join(';');
        }

        const response = await this.makeRequest('contest.standings', params, false);
        return response.result;
    }

    // 获取比赛状态
    public async getContestStatus(contestId: number): Promise<IContestStatus> {
        const response = await this.makeRequest('contest.status', {
            contestId: contestId.toString()
        }, true);
        return response.result;
    }

    // 注册比赛
    public async registerForContest(contestId: number): Promise<boolean> {
        try {
            await this.makeRequest('contest.register', {
                contestId: contestId.toString()
            }, true);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 更新网络设置
    public updateNetworkSettings(timeout?: number, proxy?: string): void {
        if (timeout) {
            this.axiosInstance.defaults.timeout = timeout;
        }

        if (proxy) {
            this.axiosInstance.defaults.proxy = {
                host: proxy,
                port: 80
            };
        }
    }
}

// 导出单例实例
export const codeforcesAPI = CodeforcesAPI.getInstance(); 