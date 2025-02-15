// 竞赛类型枚举
export enum ContestPhase {
    BEFORE = 'BEFORE',           // 比赛前
    CODING = 'CODING',           // 比赛中
    PENDING_SYSTEM_TEST = 'PENDING_SYSTEM_TEST',  // 系统测试前
    SYSTEM_TEST = 'SYSTEM_TEST', // 系统测试中
    FINISHED = 'FINISHED'        // 比赛结束
}

// 竞赛类型
export enum ContestType {
    CF = 'CF',      // 常规比赛
    IOI = 'IOI',    // IOI 赛制
    ICPC = 'ICPC'   // ICPC 赛制
}

// 竞赛基本信息接口
export interface IContestInfo {
    id: number;                     // 竞赛 ID
    name: string;                   // 竞赛名称
    type: ContestType;             // 竞赛类型
    phase: ContestPhase;           // 竞赛阶段
    frozen: boolean;               // 是否封榜
    durationSeconds: number;       // 持续时间（秒）
    startTimeSeconds?: number;     // 开始时间（Unix 时间戳）
    relativeTimeSeconds?: number;  // 相对时间（秒）
    preparedBy?: string;          // 出题人
    websiteUrl?: string;          // 竞赛网址
    description?: string;         // 竞赛描述
    difficulty?: number;          // 难度等级
    kind?: string;               // 竞赛种类
    icpcRegion?: string;        // ICPC 赛区
    country?: string;           // 举办国家
    city?: string;             // 举办城市
    season?: string;           // 赛季
}

// 竞赛状态接口
export interface IContestStatus {
    registered: boolean;           // 是否已注册
    participating: boolean;        // 是否正在参加
    online: boolean;              // 是否在线比赛
    participantType?: string;     // 参赛者类型
    ghost?: boolean;              // 是否为 ghost 参赛者
    startTimeSeconds?: number;    // 开始参赛时间
}

// 竞赛排名接口
export interface IContestRanking {
    rank: number;                 // 排名
    points: number;               // 得分
    penalty: number;              // 罚时
    problemResults: {             // 题目结果
        [problemId: string]: {
            points: number;       // 得分
            rejectedAttemptCount: number;  // 失败次数
            type: 'PRELIMINARY' | 'FINAL';  // 结果类型
            bestSubmissionTimeSeconds?: number;  // 最佳提交时间
        }
    };
}

// 竞赛通知配置
export interface IContestNotificationConfig {
    enabled: boolean;             // 是否启用通知
    beforeStart: number[];        // 开始前提醒时间（分钟）
    beforeEnd: number[];         // 结束前提醒时间（分钟）
    statusChange: boolean;       // 状态变更是否通知
    rankingChange: boolean;      // 排名变更是否通知
}

// 竞赛缓存数据
export interface IContestCache {
    lastUpdate: number;          // 最后更新时间
    contests: IContestInfo[];    // 竞赛列表
    userStatus: {                // 用户状态
        [contestId: number]: IContestStatus;
    };
    rankings: {                  // 排名数据
        [contestId: number]: IContestRanking;
    };
}

// 竞赛管理器配置
export interface IContestManagerConfig {
    autoRefresh: boolean;        // 是否自动刷新
    refreshInterval: number;     // 刷新间隔（秒）
    maxCacheAge: number;        // 最大缓存时间（秒）
    notifications: IContestNotificationConfig;  // 通知配置
} 