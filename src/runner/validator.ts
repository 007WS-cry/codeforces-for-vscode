import * as vscode from 'vscode';
import { CodeExecutor, ExecutionResult } from './executor';

export interface ValidationResult {
    passed: boolean;
    message: string;
    details?: {
        expected: string;
        actual: string;
        differences?: string[];
        executionTime?: number;
        memoryUsage?: number;
    };
}

export interface TestCase {
    input: string;
    expectedOutput: string;
}

export class OutputValidator {
    private static instance: OutputValidator;
    private executor: CodeExecutor;

    private constructor(context: vscode.ExtensionContext) {
        this.executor = CodeExecutor.getInstance(context);
    }

    public static getInstance(context: vscode.ExtensionContext): OutputValidator {
        if (!OutputValidator.instance) {
            OutputValidator.instance = new OutputValidator(context);
        }
        return OutputValidator.instance;
    }

    public async validateTestCase(
        filePath: string,
        testCase: TestCase,
        timeLimit: number = 2000
    ): Promise<ValidationResult> {
        try {
            const executionResult = await this.executor.compileAndRun(
                filePath,
                testCase.input,
                timeLimit
            );

            if (!executionResult.success) {
                return this.createErrorResult(executionResult);
            }

            return this.compareOutput(executionResult, testCase.expectedOutput);
        } catch (error) {
            return {
                passed: false,
                message: 'Validation failed',
                details: {
                    expected: testCase.expectedOutput,
                    actual: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }

    private createErrorResult(result: ExecutionResult): ValidationResult {
        return {
            passed: false,
            message: result.error || 'Execution failed',
            details: {
                expected: 'Program should execute successfully',
                actual: result.error || 'Unknown error',
                executionTime: result.executionTime,
                memoryUsage: result.memoryUsage
            }
        };
    }

    private compareOutput(
        executionResult: ExecutionResult,
        expectedOutput: string
    ): ValidationResult {
        const actualOutput = this.normalizeOutput(executionResult.output);
        const normalizedExpected = this.normalizeOutput(expectedOutput);

        if (actualOutput === normalizedExpected) {
            return {
                passed: true,
                message: 'Test case passed',
                details: {
                    expected: expectedOutput,
                    actual: executionResult.output,
                    executionTime: executionResult.executionTime,
                    memoryUsage: executionResult.memoryUsage
                }
            };
        }

        return {
            passed: false,
            message: 'Output does not match expected result',
            details: {
                expected: expectedOutput,
                actual: executionResult.output,
                differences: this.findDifferences(normalizedExpected, actualOutput),
                executionTime: executionResult.executionTime,
                memoryUsage: executionResult.memoryUsage
            }
        };
    }

    private normalizeOutput(output: string): string {
        return output
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\s+$/gm, '')
            .replace(/^\s+/gm, '');
    }

    private findDifferences(expected: string, actual: string): string[] {
        const differences: string[] = [];
        const expectedLines = expected.split('\n');
        const actualLines = actual.split('\n');

        const maxLines = Math.max(expectedLines.length, actualLines.length);

        for (let i = 0; i < maxLines; i++) {
            const expectedLine = expectedLines[i] || '';
            const actualLine = actualLines[i] || '';

            if (expectedLine !== actualLine) {
                differences.push(
                    `Line ${i + 1}:\n  Expected: "${expectedLine}"\n  Actual: "${actualLine}"`
                );
            }
        }

        if (expectedLines.length !== actualLines.length) {
            differences.push(
                `Line count mismatch: expected ${expectedLines.length} lines but got ${actualLines.length} lines`
            );
        }

        return differences;
    }

    public async validateMultipleTestCases(
        filePath: string,
        testCases: TestCase[],
        timeLimit: number = 2000
    ): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        for (const testCase of testCases) {
            const result = await this.validateTestCase(filePath, testCase, timeLimit);
            results.push({
                ...result,
                message: `Test Case #${results.length + 1}: ${result.message}`
            });

            // 如果测试用例失败，可以选择立即停止后续测试
            if (!result.passed) {
                break;
            }
        }

        return results;
    }
}

// 导出单例实例获取方法
export function getOutputValidator(context: vscode.ExtensionContext): OutputValidator {
    return OutputValidator.getInstance(context);
} 