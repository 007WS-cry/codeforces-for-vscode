import { ContestPhase, ContestType } from './contest';

// API响应的基础接口
export interface ApiResponse<T> {
    status: 'OK' | 'FAILED';
    result: T;
    comment?: string;
}

// 用户信息接口
export interface UserInfo {
    handle: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    country?: string;
    city?: string;
    organization?: string;
    rank?: string;
    rating?: number;
    maxRank?: string;
    maxRating?: number;
    lastOnlineTimeSeconds?: number;
    registrationTimeSeconds?: number;
    friendOfCount?: number;
    avatar?: string;
    titlePhoto?: string;
}

// 比赛信息接口
export interface ContestInfo {
    id: number;
    name: string;
    type: ContestType;
    phase: ContestPhase;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds?: number;
    relativeTimeSeconds?: number;
    preparedBy?: string;
    websiteUrl?: string;
    description?: string;
    difficulty?: number;
    kind?: string;
    icpcRegion?: string;
    country?: string;
    city?: string;
    season?: string;
}

// 题目信息接口
export interface ProblemInfo {
    contestId?: number;
    problemsetName?: string;
    index: string;
    name: string;
    type: ProblemType;
    points?: number;
    rating?: number;
    tags: string[];
}

// 提交信息接口
export interface SubmissionInfo {
    id: number;
    contestId?: number;
    creationTimeSeconds: number;
    relativeTimeSeconds?: number;
    problem: ProblemInfo;
    author: {
        contestId?: number;
        members: UserInfo[];
        participantType?: string;
        ghost?: boolean;
        startTimeSeconds?: number;
    };
    programmingLanguage: string;
    verdict?: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
}

// 枚举类型定义
export enum ProblemType {
    PROGRAMMING = 'PROGRAMMING',
    QUESTION = 'QUESTION'
}

export enum VerdictType {
    FAILED = 'FAILED',
    OK = 'OK',
    PARTIAL = 'PARTIAL',
    COMPILATION_ERROR = 'COMPILATION_ERROR',
    RUNTIME_ERROR = 'RUNTIME_ERROR',
    WRONG_ANSWER = 'WRONG_ANSWER',
    PRESENTATION_ERROR = 'PRESENTATION_ERROR',
    TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
    MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
    IDLENESS_LIMIT_EXCEEDED = 'IDLENESS_LIMIT_EXCEEDED',
    SECURITY_VIOLATED = 'SECURITY_VIOLATED',
    CRASHED = 'CRASHED',
    INPUT_PREPARATION_CRASHED = 'INPUT_PREPARATION_CRASHED',
    CHALLENGED = 'CHALLENGED',
    SKIPPED = 'SKIPPED',
    TESTING = 'TESTING',
    REJECTED = 'REJECTED'
}

// 配置相关接口
export interface ExtensionConfig {
    api: {
        key: string;
        secret: string;
    };
    auth: {
        autoLogin: boolean;
        rememberMe: boolean;
    };
    network: {
        timeout: number;
        proxy: {
            enabled: boolean;
            url: string;
        };
    };
    notifications: {
        enabled: boolean;
        duration: number;
    };
}

// 状态相关类型
export type StatusBarAlignment = 'left' | 'right';

export interface StatusBarItem {
    text: string;
    tooltip?: string;
    command?: string;
    color?: string;
    backgroundColor?: string;
}

// 错误类型
export class CodeforcesAPIError extends Error {
    constructor(
        override message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'CodeforcesAPIError';
    }
}

// 更新竞赛相关类型的导出
export type {
    IContestInfo,
    IContestStatus,
    IContestRanking,
    IContestNotificationConfig,
    IContestCache,
    IContestManagerConfig
} from './contest';

export {
    ContestPhase,
    ContestType
} from './contest'; 