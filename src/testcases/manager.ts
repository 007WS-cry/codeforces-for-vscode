import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TestCase, TestCaseMetadata, TestCaseResult } from './types';

export class TestCaseManager {
    private static readonly TEST_CASES_DIR = 'testcases';
    private readonly workspaceRoot: string;

    constructor(context: vscode.ExtensionContext) {
        this.workspaceRoot = context.globalStorageUri.fsPath;
    }

    /**
     * 初始化测试用例存储目录
     */
    public async initialize(): Promise<void> {
        const testCasesPath = this.getTestCasesPath();
        try {
            await fs.access(testCasesPath);
        } catch {
            await fs.mkdir(testCasesPath, { recursive: true });
        }
    }

    /**
     * 保存题目的测试用例
     */
    public async saveTestCases(contestId: number, problemIndex: string, testCases: TestCase[]): Promise<void> {
        const problemDir = await this.ensureProblemDirectory(contestId, problemIndex);
        const metadata: TestCaseMetadata = {
            contestId,
            problemIndex,
            count: testCases.length,
            lastUpdated: new Date().toISOString()
        };

        // 保存元数据
        await fs.writeFile(
            path.join(problemDir, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        // 保存测试用例
        await fs.writeFile(
            path.join(problemDir, 'testcases.json'),
            JSON.stringify(testCases, null, 2)
        );
    }

    /**
     * 获取题目的测试用例
     */
    public async getTestCases(contestId: number, problemIndex: string): Promise<TestCase[]> {
        const problemDir = this.getProblemPath(contestId, problemIndex);
        try {
            const data = await fs.readFile(path.join(problemDir, 'testcases.json'), 'utf-8');
            return JSON.parse(data) as TestCase[];
        } catch {
            return [];
        }
    }

    /**
     * 添加新的测试用例
     */
    public async addTestCase(
        contestId: number,
        problemIndex: string,
        testCase: TestCase
    ): Promise<void> {
        const testCases = await this.getTestCases(contestId, problemIndex);
        testCases.push(testCase);
        await this.saveTestCases(contestId, problemIndex, testCases);
    }

    /**
     * 更新测试用例结果
     */
    public async updateTestCaseResult(
        contestId: number,
        problemIndex: string,
        index: number,
        result: TestCaseResult
    ): Promise<void> {
        const testCases = await this.getTestCases(contestId, problemIndex);
        if (index >= 0 && index < testCases.length && testCases[index]) {
            testCases[index].result = result;
            await this.saveTestCases(contestId, problemIndex, testCases);
        }
    }

    /**
     * 删除测试用例
     */
    public async deleteTestCase(
        contestId: number,
        problemIndex: string,
        index: number
    ): Promise<void> {
        const testCases = await this.getTestCases(contestId, problemIndex);
        if (index >= 0 && index < testCases.length) {
            testCases.splice(index, 1);
            await this.saveTestCases(contestId, problemIndex, testCases);
        }
    }

    /**
     * 清除题目的所有测试用例
     */
    public async clearTestCases(contestId: number, problemIndex: string): Promise<void> {
        const problemDir = this.getProblemPath(contestId, problemIndex);
        try {
            await fs.rm(problemDir, { recursive: true, force: true });
        } catch (error) {
            console.error(`Failed to clear test cases: ${error}`);
        }
    }

    /**
     * 导出测试用例
     */
    public async exportTestCases(
        contestId: number,
        problemIndex: string,
        targetPath: string
    ): Promise<void> {
        const testCases = await this.getTestCases(contestId, problemIndex);
        await fs.writeFile(targetPath, JSON.stringify(testCases, null, 2));
    }

    /**
     * 导入测试用例
     */
    public async importTestCases(
        contestId: number,
        problemIndex: string,
        sourcePath: string
    ): Promise<void> {
        const data = await fs.readFile(sourcePath, 'utf-8');
        const testCases = JSON.parse(data) as TestCase[];
        await this.saveTestCases(contestId, problemIndex, testCases);
    }

    /**
     * 获取测试用例统计信息
     */
    public async getTestCaseStats(contestId: number, problemIndex: string): Promise<{
        total: number;
        passed: number;
        failed: number;
    }> {
        const testCases = await this.getTestCases(contestId, problemIndex);
        const stats = {
            total: testCases.length,
            passed: 0,
            failed: 0
        };

        testCases.forEach(testCase => {
            if (testCase.result) {
                if (testCase.result.passed) {
                    stats.passed++;
                } else {
                    stats.failed++;
                }
            }
        });

        return stats;
    }

    // 私有辅助方法
    private getTestCasesPath(): string {
        return path.join(this.workspaceRoot, TestCaseManager.TEST_CASES_DIR);
    }

    private getProblemPath(contestId: number, problemIndex: string): string {
        return path.join(this.getTestCasesPath(), `${contestId}_${problemIndex}`);
    }

    private async ensureProblemDirectory(contestId: number, problemIndex: string): Promise<string> {
        const problemDir = this.getProblemPath(contestId, problemIndex);
        await fs.mkdir(problemDir, { recursive: true });
        return problemDir;
    }
} 