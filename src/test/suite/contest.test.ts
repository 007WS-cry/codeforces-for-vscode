import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContestManager } from '../../contest/contestManager';
import { codeforcesAPI } from '../../utils/api';
import {
    IContestInfo,
    ContestPhase,
    ContestType,
    IContestStatus
} from '../../types';

suite('Contest Manager Test Suite', () => {
    let contestManager: ContestManager;
    let context: vscode.ExtensionContext;
    let mockContests: IContestInfo[];

    setup(() => {
        // 创建模拟的 VS Code 扩展上下文
        context = {
            subscriptions: [],
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve()
            }
        } as unknown as vscode.ExtensionContext;

        // 创建模拟的竞赛数据
        mockContests = [
            {
                id: 1,
                name: 'Future Contest',
                type: ContestType.CF,
                phase: ContestPhase.BEFORE,
                frozen: false,
                durationSeconds: 7200,
                startTimeSeconds: Math.floor(Date.now() / 1000) + 3600
            },
            {
                id: 2,
                name: 'Active Contest',
                type: ContestType.CF,
                phase: ContestPhase.CODING,
                frozen: false,
                durationSeconds: 7200,
                startTimeSeconds: Math.floor(Date.now() / 1000) - 1800
            },
            {
                id: 3,
                name: 'Past Contest',
                type: ContestType.CF,
                phase: ContestPhase.FINISHED,
                frozen: false,
                durationSeconds: 7200,
                startTimeSeconds: Math.floor(Date.now() / 1000) - 8000
            }
        ];

        // 初始化竞赛管理器
        contestManager = ContestManager.getInstance(context);
    });

    teardown(async () => {
        // 清理资源
        contestManager.dispose();
    });

    test('Should Get Contest List', async () => {
        // 模拟 API 响应
        const originalGetContestList = codeforcesAPI.getContestList;
        codeforcesAPI.getContestList = async () => mockContests;

        try {
            const contests = await contestManager.getContests(true);
            assert.strictEqual(contests.length, mockContests.length);
            assert.deepStrictEqual(contests, mockContests);
        } finally {
            codeforcesAPI.getContestList = originalGetContestList;
        }
    });

    test('Should Get Active Contests', async () => {
        const originalGetContestList = codeforcesAPI.getContestList;
        codeforcesAPI.getContestList = async () => mockContests;

        try {
            const activeContests = await contestManager.getActiveContests();
            assert.strictEqual(activeContests.length, 1);
            if (activeContests[0]) {
                assert.strictEqual(activeContests[0].phase, ContestPhase.CODING);
            }
        } finally {
            codeforcesAPI.getContestList = originalGetContestList;
        }
    });

    test('Should Get Upcoming Contests', async () => {
        const originalGetContestList = codeforcesAPI.getContestList;
        codeforcesAPI.getContestList = async () => mockContests;

        try {
            const upcomingContests = await contestManager.getUpcomingContests();
            assert.strictEqual(upcomingContests.length, 1);
            if (upcomingContests[0]) {
                assert.strictEqual(upcomingContests[0].phase, ContestPhase.BEFORE);
            }
        } finally {
            codeforcesAPI.getContestList = originalGetContestList;
        }
    });

    test('Should Get Contest Status', async () => {
        const mockStatus: IContestStatus = {
            registered: true,
            participating: true,
            online: true
        };

        const originalGetContestStatus = codeforcesAPI.getContestStatus;
        codeforcesAPI.getContestStatus = async () => mockStatus;

        try {
            const status = await contestManager.getContestStatus(1);
            assert.deepStrictEqual(status, mockStatus);
        } finally {
            codeforcesAPI.getContestStatus = originalGetContestStatus;
        }
    });

    test('Should Register For Contest', async () => {
        const originalRegisterForContest = codeforcesAPI.registerForContest;
        const originalGetContestStatus = codeforcesAPI.getContestStatus;

        codeforcesAPI.registerForContest = async () => true;
        codeforcesAPI.getContestStatus = async () => ({
            registered: true,
            participating: true,
            online: true
        });

        try {
            const result = await contestManager.registerForContest(1);
            assert.strictEqual(result, true);
        } finally {
            codeforcesAPI.registerForContest = originalRegisterForContest;
            codeforcesAPI.getContestStatus = originalGetContestStatus;
        }
    });

    test('Should Handle Registration Failure', async () => {
        const originalRegisterForContest = codeforcesAPI.registerForContest;
        codeforcesAPI.registerForContest = async () => {
            throw new Error('Registration failed');
        };

        try {
            const result = await contestManager.registerForContest(1);
            assert.strictEqual(result, false);
        } finally {
            codeforcesAPI.registerForContest = originalRegisterForContest;
        }
    });

    test('Should Emit Events On Contest Change', async () => {
        let emittedContests: IContestInfo[] | undefined;
        contestManager.onDidChangeContests(contests => {
            emittedContests = contests;
        });

        const originalGetContestList = codeforcesAPI.getContestList;
        codeforcesAPI.getContestList = async () => mockContests;

        try {
            await contestManager.getContests(true);
            assert.deepStrictEqual(emittedContests, mockContests);
        } finally {
            codeforcesAPI.getContestList = originalGetContestList;
        }
    });

    test('Should Cache Contest Data', async () => {
        const originalGetContestList = codeforcesAPI.getContestList;
        let callCount = 0;
        codeforcesAPI.getContestList = async () => {
            callCount++;
            return mockContests;
        };

        try {
            // 首次调用
            await contestManager.getContests(true);
            // 第二次调用应该使用缓存
            await contestManager.getContests(false);
            assert.strictEqual(callCount, 1);
        } finally {
            codeforcesAPI.getContestList = originalGetContestList;
        }
    });
}); 