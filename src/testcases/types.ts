/**
 * 测试用例接口定义
 */
export interface TestCase {
	output: any;
    // 基本信息
    id: string;
    input: string;
    expectedOutput: string;
    explanation?: string;
    
    // 测试结果
    result?: TestCaseResult;
    
    // 元数据
    createdAt: string;
    updatedAt: string;
    source: TestCaseSource;
    tags?: string[];
}

/**
 * 测试用例来源
 */
export enum TestCaseSource {
    SAMPLE = 'sample',      // 样例测试
    USER = 'user',          // 用户添加
    IMPORTED = 'imported'   // 导入的测试
}

/**
 * 测试用例结果
 */
export interface TestCaseResult {
    passed: boolean;
    actualOutput?: string;
    executionTime?: number;  // 毫秒
    memoryUsed?: number;     // KB
    errorMessage?: string;
    timestamp: string;
}

/**
 * 测试用例元数据
 */
export interface TestCaseMetadata {
    contestId: number;
    problemIndex: string;
    count: number;
    lastUpdated: string;
    tags?: string[];
    statistics?: {
        passed: number;
        failed: number;
        untested: number;
    };
}

/**
 * 测试用例验证结果
 */
export interface TestCaseValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * 测试用例过滤选项
 */
export interface TestCaseFilter {
    status?: 'passed' | 'failed' | 'untested';
    source?: TestCaseSource;
    tags?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
}

/**
 * 测试用例排序选项
 */
export enum TestCaseSortOption {
    CREATED_DATE = 'createdDate',
    UPDATED_DATE = 'updatedDate',
    EXECUTION_TIME = 'executionTime',
    MEMORY_USED = 'memoryUsed'
}

/**
 * 测试用例批量操作结果
 */
export interface BatchOperationResult {
    successful: number;
    failed: number;
    errors: Array<{
        id: string;
        error: string;
    }>;
}

/**
 * 测试用例导出格式
 */
export interface TestCaseExport {
    metadata: TestCaseMetadata;
    testCases: TestCase[];
    version: string;
    exportDate: string;
} 