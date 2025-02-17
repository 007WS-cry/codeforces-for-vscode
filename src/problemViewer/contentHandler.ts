import { ProblemData } from './types';

export class ContentHandler {
    private static readonly MATH_INLINE_REGEX = /\$([^\$]+)\$/g;
    private static readonly MATH_BLOCK_REGEX = /\$\$([^\$]+)\$\$/g;

    public static processProblemContent(problem: ProblemData): string {
        let content = problem.content;

        // 处理数学公式
        content = this.processMathFormulas(content);

        // 处理代码块
        content = this.processCodeBlocks(content);

        // 构建完整的 HTML 内容
        return this.buildProblemHtml(problem, content);
    }

    private static processMathFormulas(content: string): string {
        // 将 $...$ 转换为 \(...\)
        content = content.replace(this.MATH_INLINE_REGEX, '\\($1\\)');
        // 将 $$...$$ 转换为 \[...\]
        content = content.replace(this.MATH_BLOCK_REGEX, '\\[$1\\]');
        return content;
    }

    private static processCodeBlocks(content: string): string {
        // 处理代码块，添加语法高亮支持
        return content.replace(/```(\w*)\n([\s\S]*?)```/g, (_, language, code) => {
            const highlightClass = language ? ` class="language-${language}"` : '';
            return `<pre><code${highlightClass}>${this.escapeHtml(code.trim())}</code></pre>`;
        });
    }

    private static buildProblemHtml(problem: ProblemData, processedContent: string): string {
        const difficultyHtml = problem.difficulty
            ? `<div class="difficulty-tag" data-difficulty="${problem.difficulty}">
                 Difficulty: ${problem.difficulty}
               </div>`
            : '';

        return `
            <div class="problem-container">
                <div class="problem-header">
                    <h1 class="problem-title">${this.escapeHtml(problem.name)}</h1>
                    <div class="problem-meta">
                        <span class="time-limit">Time limit: ${problem.timeLimit} seconds</span>
                        <span class="memory-limit">Memory limit: ${problem.memoryLimit} megabytes</span>
                        ${difficultyHtml}
                    </div>
                </div>

                <div class="problem-statement">
                    ${processedContent}
                </div>

                <div class="input-specification">
                    <h2>Input</h2>
                    ${problem.inputSpec}
                </div>

                <div class="output-specification">
                    <h2>Output</h2>
                    ${problem.outputSpec}
                </div>

                ${this.renderSamples(problem.samples)}

                ${problem.note ? `
                    <div class="problem-note">
                        <h2>Note</h2>
                        ${problem.note}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private static renderSamples(samples: ProblemData['samples']): string {
        if (!samples.length) {
            return '';
        }

        return `
            <div class="samples-section">
                <h2>Examples</h2>
                <div class="samples">
                    ${samples.map((sample, index) => `
                        <div class="sample" data-sample-index="${index}">
                            <div class="sample-header">
                                <span>Sample ${index + 1}</span>
                                <button class="copy-button" data-sample-id="${index}">
                                    Copy
                                </button>
                            </div>
                            <div class="sample-content">
                                <div class="sample-input">
                                    <div class="sample-title">Input</div>
                                    <pre><code>${this.escapeHtml(sample.input)}</code></pre>
                                </div>
                                <div class="sample-output">
                                    <div class="sample-title">Output</div>
                                    <pre><code>${this.escapeHtml(sample.output)}</code></pre>
                                </div>
                                ${sample.explanation ? `
                                    <div class="sample-explanation">
                                        <div class="sample-title">Explanation</div>
                                        <div>${sample.explanation}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    private static escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
