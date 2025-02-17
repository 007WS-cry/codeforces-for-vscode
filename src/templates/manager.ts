import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TemplateGenerator } from './generator';
import { ProblemData } from '../problemViewer/types';

export class TemplateManager {
    private readonly generator: TemplateGenerator;
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.generator = new TemplateGenerator(context);
    }

    /**
     * 创建新的代码文件
     */
    public async createCodeFile(
        problem: ProblemData,
        language: string,
        targetDir?: string
    ): Promise<void> {
        try {
            // 生成代码内容
            const content = await this.generator.generateTemplate(problem, language);

            // 确定目标目录
            const directory = targetDir || await this.getDefaultDirectory(problem);
            await fs.mkdir(directory, { recursive: true });

            // 创建文件
            const filePath = path.join(directory, this.getFileName(problem, language));
            await fs.writeFile(filePath, content);

            // 打开文件
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

        } catch (error) {
            console.error('Failed to create code file:', error);
            throw error;
        }
    }

    /**
     * 获取支持的语言列表
     */
    public getSupportedLanguages(): string[] {
        return ['cpp', 'python', 'java'];
    }

    /**
     * 获取默认目录
     */
    private async getDefaultDirectory(problem: ProblemData): Promise<string> {
        if (!vscode.workspace.workspaceFolders) {
            throw new Error('No workspace folder is opened');
        }

        const baseDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        return path.join(
            baseDir,
            'codeforces',
            `contest_${problem.contestId}`,
            `problem_${problem.problemIndex}`
        );
    }

    /**
     * 获取文件名
     */
    private getFileName(problem: ProblemData, language: string): string {
        switch (language.toLowerCase()) {
            case 'cpp':
                return 'solution.cpp';
            case 'python':
                return 'solution.py';
            case 'java':
                return 'Main.java';
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    /**
     * 检查文件是否已存在
     */
    public async checkFileExists(
        problem: ProblemData,
        language: string,
        directory?: string
    ): Promise<boolean> {
        const dir = directory || await this.getDefaultDirectory(problem);
        const filePath = path.join(dir, this.getFileName(problem, language));
        
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取用户首选语言
     */
    public getPreferredLanguage(): string {
        const config = vscode.workspace.getConfiguration('codeforces');
        return config.get<string>('preferredLanguage', 'cpp');
    }

    /**
     * 设置用户首选语言
     */
    public async setPreferredLanguage(language: string): Promise<void> {
        if (!this.getSupportedLanguages().includes(language)) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const config = vscode.workspace.getConfiguration('codeforces');
        await config.update('preferredLanguage', language, true);
    }

    /**
     * 获取自定义模板路径
     */
    public getCustomTemplatePath(language: string): string {
        const config = vscode.workspace.getConfiguration('codeforces');
        const templates = config.get<Record<string, string>>('customTemplates', {});
        return templates[language] || '';
    }

    /**
     * 设置自定义模板路径
     */
    public async setCustomTemplatePath(language: string, templatePath: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeforces');
        const templates = config.get<Record<string, string>>('customTemplates', {});
        
        templates[language] = templatePath;
        await config.update('customTemplates', templates, true);
    }

    /**
     * 创建默认配置
     */
    public async createDefaultConfig(): Promise<void> {
        const config = vscode.workspace.getConfiguration('codeforces');
        
        // 设置默认值（如果不存在）
        if (!config.has('preferredLanguage')) {
            await config.update('preferredLanguage', 'cpp', true);
        }
        
        if (!config.has('customTemplates')) {
            await config.update('customTemplates', {}, true);
        }
    }
} 