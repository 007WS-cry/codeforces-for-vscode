import * as vscode from 'vscode';

export interface DifficultyRange {
    min: number;
    max: number;
    label: string;
    color: string;
}

export class DifficultyManager {
    private static instance: DifficultyManager;

    // Codeforces 难度范围定义
    private readonly difficultyRanges: DifficultyRange[] = [
        { min: 0, max: 799, label: 'Newbie', color: '#808080' },
        { min: 800, max: 1199, label: 'Pupil', color: '#008000' },
        { min: 1200, max: 1399, label: 'Specialist', color: '#03A89E' },
        { min: 1400, max: 1599, label: 'Expert', color: '#0000FF' },
        { min: 1600, max: 1899, label: 'Candidate Master', color: '#AA00AA' },
        { min: 1900, max: 2099, label: 'Master', color: '#FF8C00' },
        { min: 2100, max: 2299, label: 'International Master', color: '#FF8C00' },
        { min: 2300, max: 2399, label: 'Grandmaster', color: '#FF0000' },
        { min: 2400, max: 2599, label: 'International Grandmaster', color: '#FF0000' },
        { min: 2600, max: 3000, label: 'Legendary Grandmaster', color: '#FF0000' }
    ];

    private constructor(_context: vscode.ExtensionContext) {}

    public static getInstance(context: vscode.ExtensionContext): DifficultyManager {
        if (!DifficultyManager.instance) {
            DifficultyManager.instance = new DifficultyManager(context);
        }
        return DifficultyManager.instance;
    }

    /**
     * 获取难度标签和颜色
     */
    public getDifficultyInfo(rating: number): DifficultyRange {
        const range = this.difficultyRanges.find(
            range => rating >= range.min && rating <= range.max
        );

        return range || {
            min: 0,
            max: 0,
            label: 'Unknown',
            color: '#000000'
        };
    }

    /**
     * 获取难度HTML标签
     */
    public getDifficultyBadge(rating: number): string {
        const info = this.getDifficultyInfo(rating);
        return `<span style="color: ${info.color}; font-weight: bold;">${rating} (${info.label})</span>`;
    }

    /**
     * 获取难度CSS类名
     */
    public getDifficultyClassName(rating: number): string {
        const info = this.getDifficultyInfo(rating);
        return `difficulty-${info.label.toLowerCase().replace(/\s+/g, '-')}`;
    }

    /**
     * 获取所有难度范围
     */
    public getAllDifficultyRanges(): DifficultyRange[] {
        return [...this.difficultyRanges];
    }

    /**
     * 检查难度是否在指定范围内
     */
    public isInRange(rating: number, minRating: number, maxRating: number): boolean {
        return rating >= minRating && rating <= maxRating;
    }

    /**
     * 获取难度趋势
     * @param ratings 历史难度数组
     * @returns 趋势信息
     */
    public getDifficultyTrend(ratings: number[]): {
        trend: 'increasing' | 'decreasing' | 'stable';
        change: number;
    } {
        if (ratings.length < 2) {
            return { trend: 'stable', change: 0 };
        }

        // 只看最近5个难度，但确保至少有2个元素
        const recentRatings = ratings.slice(-Math.min(5, ratings.length));
        const firstRating = recentRatings[0];
        const lastRating = recentRatings[recentRatings.length - 1];

        if (firstRating === undefined || lastRating === undefined) {
            return { trend: 'stable', change: 0 };
        }

        const change = lastRating - firstRating;

        return {
            trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
            change: Math.abs(change)
        };
    }

    /**
     * 获取推荐的下一个难度范围
     */
    public getRecommendedNextDifficulty(currentRating: number): DifficultyRange | null {
        const currentRange = this.getDifficultyInfo(currentRating);
        const currentIndex = this.difficultyRanges.findIndex(
            range => range.min === currentRange.min
        );

        if (currentIndex === -1 || currentIndex === this.difficultyRanges.length - 1) {
            return null;
        }

        const nextRange = this.difficultyRanges[currentIndex + 1];
        return nextRange || null;
    }

    /**
     * 生成难度分布统计
     */
    public generateDifficultyDistribution(problems: { rating: number }[]): Map<string, number> {
        const distribution = new Map<string, number>();
        
        this.difficultyRanges.forEach(range => {
            distribution.set(range.label, 0);
        });

        problems.forEach(problem => {
            const info = this.getDifficultyInfo(problem.rating);
            const count = distribution.get(info.label) || 0;
            distribution.set(info.label, count + 1);
        });

        return distribution;
    }

    /**
     * 获取难度CSS样式
     */
    public getDifficultyStyles(): string {
        return this.difficultyRanges
            .map(range => `
                .difficulty-${range.label.toLowerCase().replace(/\s+/g, '-')} {
                    color: ${range.color};
                    font-weight: bold;
                }
            `)
            .join('\n');
    }
}

// 导出单例实例获取方法
export function getDifficultyManager(context: vscode.ExtensionContext): DifficultyManager {
    return DifficultyManager.getInstance(context);
} 