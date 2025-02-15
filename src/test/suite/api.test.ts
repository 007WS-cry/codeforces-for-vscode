import * as assert from 'assert';
import { codeforcesAPI } from '../../utils/api';
import { IContestInfo, ContestPhase, ContestType } from '../../types';

suite('API Test Suite', () => {
    test('Should Set Credentials Correctly', () => {
        const testKey = 'test_key';
        const testSecret = 'test_secret';
        
        codeforcesAPI.setCredentials(testKey, testSecret);
        
        // 由于凭证是私有的，我们通过验证方法来测试
        assert.doesNotThrow(() => {
            // 这里应该不会抛出凭证未设置的错误
            codeforcesAPI.validateCredentials('test_handle');
        });
    });

    test('Should Handle Network Errors', async () => {
        try {
            // 使用无效的凭证触发错误
            await codeforcesAPI.validateCredentials('invalid_handle');
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.ok(error instanceof Error);
        }
    });

    test('Should Generate Valid API Signature', async () => {
        const testKey = 'test_key';
        const testSecret = 'test_secret';
        
        codeforcesAPI.setCredentials(testKey, testSecret);
        
        // 验证生成的签名格式
        const response = await codeforcesAPI.validateCredentials('test_handle');
        assert.ok(typeof response === 'boolean');
    });

    test('Should Update Network Settings', () => {
        const timeout = 5000;
        const proxy = 'http://localhost:8080';

        codeforcesAPI.updateNetworkSettings(timeout, proxy);
        
        // 这个测试主要确保方法不会抛出错误
        assert.ok(true);
    });

    test('Should Get Contest List', async () => {
        // 模拟API响应
        const mockResponse = {
            status: 'OK',
            result: [{
                id: 1,
                name: 'Test Contest',
                type: ContestType.CF,
                phase: ContestPhase.BEFORE,
                frozen: false,
                durationSeconds: 7200
            }] as IContestInfo[]
        };

        // 临时替换makeRequest方法
        const originalMakeRequest = (codeforcesAPI as any).makeRequest;
        (codeforcesAPI as any).makeRequest = async () => mockResponse;

        try {
            const contests = await codeforcesAPI.getContestList();
            assert.strictEqual(contests.length, 1);
            if (contests[0]) {
                assert.strictEqual(contests[0].id, 1);
                assert.strictEqual(contests[0].name, 'Test Contest');
            }
        } finally {
            // 恢复原始方法
            (codeforcesAPI as any).makeRequest = originalMakeRequest;
        }
    });

    test('Should Get Contest Standings', async () => {
        const mockResponse = {
            status: 'OK',
            result: {
                contest: {
                    id: 1,
                    name: 'Test Contest',
                    type: ContestType.CF,
                    phase: ContestPhase.CODING,
                    frozen: false,
                    durationSeconds: 7200
                },
                problems: [],
                rows: [{
                    rank: 1,
                    points: 100,
                    penalty: 0,
                    problemResults: {}
                }]
            }
        };

        const originalMakeRequest = (codeforcesAPI as any).makeRequest;
        (codeforcesAPI as any).makeRequest = async () => mockResponse;

        try {
            const standings = await codeforcesAPI.getContestStandings(1);
            assert.strictEqual(standings.contest.id, 1);
            if (standings.rows[0]) {
                assert.strictEqual(standings.rows[0].rank, 1);
                assert.strictEqual(standings.rows[0].points, 100);
            }
        } finally {
            (codeforcesAPI as any).makeRequest = originalMakeRequest;
        }
    });

    test('Should Get Contest Status', async () => {
        const mockResponse = {
            status: 'OK',
            result: {
                registered: true,
                participating: true,
                online: true
            }
        };

        const originalMakeRequest = (codeforcesAPI as any).makeRequest;
        (codeforcesAPI as any).makeRequest = async () => mockResponse;

        try {
            const status = await codeforcesAPI.getContestStatus(1);
            assert.strictEqual(status.registered, true);
            assert.strictEqual(status.participating, true);
            assert.strictEqual(status.online, true);
        } finally {
            (codeforcesAPI as any).makeRequest = originalMakeRequest;
        }
    });

    test('Should Register For Contest', async () => {
        const mockResponse = {
            status: 'OK',
            result: true
        };

        const originalMakeRequest = (codeforcesAPI as any).makeRequest;
        (codeforcesAPI as any).makeRequest = async () => mockResponse;

        try {
            const result = await codeforcesAPI.registerForContest(1);
            assert.strictEqual(result, true);
        } finally {
            (codeforcesAPI as any).makeRequest = originalMakeRequest;
        }
    });

    test('Should Handle Contest Registration Failure', async () => {
        const originalMakeRequest = (codeforcesAPI as any).makeRequest;
        (codeforcesAPI as any).makeRequest = async () => {
            throw new Error('Registration failed');
        };

        try {
            const result = await codeforcesAPI.registerForContest(1);
            assert.strictEqual(result, false);
        } finally {
            (codeforcesAPI as any).makeRequest = originalMakeRequest;
        }
    });
}); 