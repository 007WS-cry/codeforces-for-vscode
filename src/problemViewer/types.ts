export interface ProblemData {
    contestId: number;
    problemIndex: string;
    name: string;
    timeLimit: number;
    memoryLimit: number;
    difficulty?: number;
    content: string;
    inputSpec: string;
    outputSpec: string;
    samples: SampleTestCase[];
    note?: string;
}

export interface SampleTestCase {
    input: string;
    output: string;
    explanation?: string;
}

export interface ProblemViewerState {
    currentProblem?: ProblemData;
    isLoading: boolean;
    error?: string;
}

export enum MessageType {
    UPDATE_CONTENT = 'updateContent',
    COPY_SAMPLE = 'copySample',
    THEME_CHANGED = 'themeChanged',
    ERROR = 'error'
}

export interface WebviewMessage {
    type: MessageType;
    data: any;
} 