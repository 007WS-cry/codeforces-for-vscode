import * as vscode from 'vscode';
import { DifficultyManager } from './manager';

export class DifficultyDisplay {
    private static instance: DifficultyDisplay;
    private readonly difficultyManager: DifficultyManager;
    private statusBarItem: vscode.StatusBarItem;

    private constructor(context: vscode.ExtensionContext) {
        this.difficultyManager = DifficultyManager.getInstance(context);
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
    }

    public static getInstance(context: vscode.ExtensionContext): DifficultyDisplay {
        if (!DifficultyDisplay.instance) {
            DifficultyDisplay.instance = new DifficultyDisplay(context);
        }
        return DifficultyDisplay.instance;
    }

    /**
     * 显示题目难度在状态栏
     */
    public showDifficultyInStatusBar(rating: number): void {
        const info = this.difficultyManager.getDifficultyInfo(rating);
        this.statusBarItem.text = `$(symbol-number) ${rating}`;
        this.statusBarItem.tooltip = `Difficulty: ${info.label}`;
        this.statusBarItem.color = info.color;
        this.statusBarItem.show();
    }

    /**
     * 生成难度趋势图表的HTML
     */
    public generateTrendChart(ratings: number[]): string {
        const trend = this.difficultyManager.getDifficultyTrend(ratings);
        const trendIcon = this.getTrendIcon(trend.trend);
        const chartData = this.prepareChartData(ratings);

        return `
            <div class="difficulty-trend">
                <div class="trend-header">
                    <span class="trend-icon">${trendIcon}</span>
                    <span class="trend-label">${trend.trend.toUpperCase()}</span>
                    <span class="trend-change">${trend.change > 0 ? '+' : ''}${trend.change}</span>
                </div>
                <div class="chart-container">
                    ${this.generateChartSVG(chartData)}
                </div>
            </div>
        `;
    }

    /**
     * 生成难度分布图表的HTML
     */
    public generateDistributionChart(problems: { rating: number }[]): string {
        const distribution = this.difficultyManager.generateDifficultyDistribution(problems);
        const maxCount = Math.max(...Array.from(distribution.values()));

        return `
            <div class="difficulty-distribution">
                ${Array.from(distribution.entries()).map(([label, count]) => {
                    const info = this.difficultyManager.getDifficultyInfo(
                        this.getRatingForLabel(label)
                    );
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return `
                        <div class="distribution-bar">
                            <div class="bar-label">${label}</div>
                            <div class="bar-container">
                                <div class="bar" 
                                     style="width: ${percentage}%; background-color: ${info.color}">
                                </div>
                                <span class="bar-count">${count}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * 生成难度标签的HTML
     */
    public generateDifficultyBadge(rating: number, showTrend: boolean = false, previousRating?: number): string {
        const info = this.difficultyManager.getDifficultyInfo(rating);
        const trendIndicator = showTrend && previousRating !== undefined
            ? this.getTrendIndicator(rating, previousRating)
            : '';

        return `
            <span class="difficulty-badge ${this.difficultyManager.getDifficultyClassName(rating)}">
                ${rating} ${trendIndicator}
                <span class="badge-label">${info.label}</span>
            </span>
        `;
    }

    /**
     * 获取难度CSS样式
     */
    public getDifficultyStyles(): string {
        return `
            .difficulty-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
                margin: 0 4px;
            }

            .badge-label {
                margin-left: 4px;
                font-size: 0.9em;
                opacity: 0.8;
            }

            .difficulty-trend {
                margin: 10px 0;
            }

            .trend-header {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
            }

            .trend-icon {
                margin-right: 5px;
            }

            .chart-container {
                height: 100px;
                width: 100%;
            }

            .difficulty-distribution {
                margin: 10px 0;
            }

            .distribution-bar {
                display: flex;
                align-items: center;
                margin: 4px 0;
            }

            .bar-container {
                flex: 1;
                height: 20px;
                margin-left: 10px;
                position: relative;
            }

            .bar {
                height: 100%;
                transition: width 0.3s ease;
            }

            .bar-count {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--vscode-editor-foreground);
            }
        ` + this.difficultyManager.getDifficultyStyles();
    }

    // 私有辅助方法
    private getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
        switch (trend) {
            case 'increasing':
                return '$(arrow-up)';
            case 'decreasing':
                return '$(arrow-down)';
            default:
                return '$(arrow-right)';
        }
    }

    private getTrendIndicator(current: number, previous: number): string {
        const diff = current - previous;
        if (diff > 0) {
            return `<span class="trend-up">▲${diff}</span>`;
        } else if (diff < 0) {
            return `<span class="trend-down">▼${Math.abs(diff)}</span>`;
        }
        return '';
    }

    private prepareChartData(ratings: number[]): { x: number; y: number }[] {
        return ratings.map((rating, index) => ({
            x: index,
            y: rating
        }));
    }

    private generateChartSVG(data: { x: number; y: number }[]): string {
        if (data.length < 2) {
            return '<div class="no-data">Not enough data</div>';
        }

        const width = 400;
        const height = 100;
        const padding = 10;

        const xScale = (width - 2 * padding) / (data.length - 1);
        const yMin = Math.min(...data.map(d => d.y));
        const yMax = Math.max(...data.map(d => d.y));
        const yScale = (height - 2 * padding) / (yMax - yMin);

        const points = data.map((d, i) => {
            const x = padding + i * xScale;
            const y = height - (padding + (d.y - yMin) * yScale);
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <polyline
                    points="${points}"
                    fill="none"
                    stroke="var(--vscode-charts-blue)"
                    stroke-width="2"
                />
            </svg>
        `;
    }

    private getRatingForLabel(label: string): number {
        const range = this.difficultyManager.getAllDifficultyRanges()
            .find(r => r.label === label);
        return range ? range.min : 0;
    }

    /**
     * 清理资源
     */
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}

// 导出单例实例获取方法
export function getDifficultyDisplay(context: vscode.ExtensionContext): DifficultyDisplay {
    return DifficultyDisplay.getInstance(context);
} 