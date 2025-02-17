import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ProblemData } from '../problemViewer/types';

export class TemplateGenerator {
    private readonly TEMPLATE_DIR = 'templates';
    private readonly extensionPath: string;

    constructor(context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;
    }

    /**
     * 生成代码模板
     */
    public async generateTemplate(
        problem: ProblemData,
        language: string
    ): Promise<string> {
        try {
            // 获取模板内容
            const template = await this.getTemplateContent(language);
            if (!template) {
                throw new Error(`No template found for language: ${language}`);
            }

            // 替换模板变量
            return this.replaceTemplateVariables(template, problem);
        } catch (error) {
            console.error('Failed to generate template:', error);
            throw error;
        }
    }

    /**
     * 获取模板内容
     */
    private async getTemplateContent(language: string): Promise<string> {
        const templatePath = this.getTemplatePath(language);
        try {
            return await fs.readFile(templatePath, 'utf-8');
        } catch (error) {
            console.error(`Failed to read template for ${language}:`, error);
            return this.getFallbackTemplate(language);
        }
    }

    /**
     * 替换模板变量
     */
    private replaceTemplateVariables(template: string, problem: ProblemData): string {
        const variables = {
            'PROBLEM_NAME': problem.name,
            'PROBLEM_URL': `https://codeforces.com/contest/${problem.contestId}/problem/${problem.problemIndex}`,
            'TIME_LIMIT': problem.timeLimit.toString(),
            'MEMORY_LIMIT': problem.memoryLimit.toString(),
            'PROBLEM_INDEX': problem.problemIndex,
            'CONTEST_ID': problem.contestId.toString(),
            'DIFFICULTY': problem.difficulty?.toString() || 'Unknown',
            'CURRENT_DATE': new Date().toISOString().split('T')[0],
            'SAMPLE_INPUT': this.formatSampleIO(problem.samples[0]?.input || ''),
            'SAMPLE_OUTPUT': this.formatSampleIO(problem.samples[0]?.output || '')
        };

        return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const key = variable.trim();
            return variables[key as keyof typeof variables] || match;
        });
    }

    /**
     * 获取模板文件路径
     */
    private getTemplatePath(language: string): string {
        const templateFileName = this.getTemplateFileName(language);
        return path.join(this.extensionPath, 'resources', this.TEMPLATE_DIR, templateFileName);
    }

    /**
     * 获取模板文件名
     */
    private getTemplateFileName(language: string): string {
        switch (language.toLowerCase()) {
            case 'cpp':
                return 'cpp/main.cpp';
            case 'python':
                return 'python/main.py';
            case 'java':
                return 'java/Main.java';
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    /**
     * 获取备用模板
     */
    private getFallbackTemplate(language: string): string {
        switch (language.toLowerCase()) {
            case 'cpp':
                return this.getCppFallbackTemplate();
            case 'python':
                return this.getPythonFallbackTemplate();
            case 'java':
                return this.getJavaFallbackTemplate();
            default:
                throw new Error(`No fallback template for language: ${language}`);
        }
    }

    /**
     * 格式化样例输入输出
     */
    private formatSampleIO(content: string): string {
        return content.split('\n').map(line => line.trim()).join('\n');
    }

    // 备用模板定义
    private getCppFallbackTemplate(): string {
        return `
// Problem: {{PROBLEM_NAME}}
// Contest: {{CONTEST_ID}}
// URL: {{PROBLEM_URL}}
// Memory Limit: {{MEMORY_LIMIT}} MB
// Time Limit: {{TIME_LIMIT}} seconds
// Powered by Codeforces for VS Code

#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Your code here
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int t = 1;
    // cin >> t;
    while (t--) {
        solve();
    }
    
    return 0;
}
`;
    }

    private getPythonFallbackTemplate(): string {
        return `
# Problem: {{PROBLEM_NAME}}
# Contest: {{CONTEST_ID}}
# URL: {{PROBLEM_URL}}
# Memory Limit: {{MEMORY_LIMIT}} MB
# Time Limit: {{TIME_LIMIT}} seconds
# Powered by Codeforces for VS Code

import sys
input = sys.stdin.readline

def solve():
    # Your code here
    pass

def main():
    t = 1
    # t = int(input())
    for _ in range(t):
        solve()

if __name__ == "__main__":
    main()
`;
    }

    private getJavaFallbackTemplate(): string {
        return `
// Problem: {{PROBLEM_NAME}}
// Contest: {{CONTEST_ID}}
// URL: {{PROBLEM_URL}}
// Memory Limit: {{MEMORY_LIMIT}} MB
// Time Limit: {{TIME_LIMIT}} seconds
// Powered by Codeforces for VS Code

import java.io.*;
import java.util.*;

public class Main {
    static FastReader in = new FastReader();
    static PrintWriter out = new PrintWriter(System.out);
    
    public static void solve() {
        // Your code here
    }
    
    public static void main(String[] args) {
        int t = 1;
        // t = in.nextInt();
        while (t-- > 0) {
            solve();
        }
        out.close();
    }
    
    static class FastReader {
        BufferedReader br;
        StringTokenizer st;
        
        public FastReader() {
            br = new BufferedReader(new InputStreamReader(System.in));
        }
        
        String next() {
            while (st == null || !st.hasMoreElements()) {
                try {
                    st = new StringTokenizer(br.readLine());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return st.nextToken();
        }
        
        int nextInt() { return Integer.parseInt(next()); }
        long nextLong() { return Long.parseLong(next()); }
        double nextDouble() { return Double.parseDouble(next()); }
        
        String nextLine() {
            String str = "";
            try {
                str = br.readLine();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return str;
        }
    }
}
`;
    }
} 