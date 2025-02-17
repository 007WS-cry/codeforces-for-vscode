import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTime?: number;
    memoryUsage?: number;
}

export interface CompilationResult {
    success: boolean;
    error?: string;
}

export class CodeExecutor {
    private static instance: CodeExecutor;

    private constructor(_context: vscode.ExtensionContext) {
    }

    public static getInstance(context: vscode.ExtensionContext): CodeExecutor {
        if (!CodeExecutor.instance) {
            CodeExecutor.instance = new CodeExecutor(context);
        }
        return CodeExecutor.instance;
    }

    public async compileAndRun(
        filePath: string,
        input: string,
        timeLimit: number = 2000
    ): Promise<ExecutionResult> {
        try {
            const extension = path.extname(filePath);
            const compilationResult = await this.compile(filePath, extension);

            if (!compilationResult.success) {
                return {
                    success: false,
                    output: '',
                    error: compilationResult.error
                };
            }

            return await this.execute(filePath, input, extension, timeLimit);
        } catch (error) {
            return {
                success: false,
                output: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private async compile(filePath: string, extension: string): Promise<CompilationResult> {
        try {
            switch (extension) {
                case '.cpp':
                    await execAsync(`g++ "${filePath}" -o "${filePath}.exe" -std=c++17 -O2`);
                    break;
                case '.c':
                    await execAsync(`gcc "${filePath}" -o "${filePath}.exe" -O2`);
                    break;
                case '.java':
                    await execAsync(`javac "${filePath}"`);
                    break;
                case '.py':
                    // Python不需要编译
                    return { success: true };
                default:
                    throw new Error(`Unsupported file type: ${extension}`);
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Compilation failed'
            };
        }
    }

    private async execute(
        filePath: string,
        input: string,
        extension: string,
        timeLimit: number
    ): Promise<ExecutionResult> {
        return new Promise((resolve) => {
            let command: string;
            const baseDir = path.dirname(filePath);
            const fileName = path.basename(filePath);

            switch (extension) {
                case '.cpp':
                case '.c':
                    command = `"${filePath}.exe"`;
                    break;
                case '.java':
                    command = `java -cp "${baseDir}" "${path.parse(fileName).name}"`;
                    break;
                case '.py':
                    command = `python "${filePath}"`;
                    break;
                default:
                    resolve({
                        success: false,
                        output: '',
                        error: `Unsupported file type: ${extension}`
                    });
                    return;
            }

            const startTime = process.hrtime();
            const child = spawn(command, {
                shell: true,
                cwd: baseDir
            });

            let output = '';
            let error = '';
            let killed = false;

            const timer = setTimeout(() => {
                killed = true;
                child.kill();
            }, timeLimit);

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            child.stdin.write(input);
            child.stdin.end();

            child.on('close', (code) => {
                clearTimeout(timer);
                const [seconds, nanoseconds] = process.hrtime(startTime);
                const executionTime = seconds * 1000 + nanoseconds / 1000000;

                if (killed) {
                    resolve({
                        success: false,
                        output: '',
                        error: 'Time limit exceeded',
                        executionTime
                    });
                } else if (code !== 0) {
                    resolve({
                        success: false,
                        output,
                        error: error || `Process exited with code ${code}`,
                        executionTime
                    });
                } else {
                    resolve({
                        success: true,
                        output: output.trim(),
                        executionTime
                    });
                }

                // 清理编译生成的文件
                this.cleanupFiles(filePath, extension);
            });
        });
    }

    private async cleanupFiles(filePath: string, extension: string): Promise<void> {
        try {
            switch (extension) {
                case '.cpp':
                case '.c':
                    fs.unlinkSync(`${filePath}.exe`);
                    break;
                case '.java':
                    const className = path.parse(filePath).name;
                    fs.unlinkSync(`${path.dirname(filePath)}/${className}.class`);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Failed to cleanup files:', error);
        }
    }
}

// 导出单例实例获取方法
export function getCodeExecutor(context: vscode.ExtensionContext): CodeExecutor {
    return CodeExecutor.getInstance(context);
} 