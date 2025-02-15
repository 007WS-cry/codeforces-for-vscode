// 插件标识符
export const EXTENSION_ID = 'codeforces-for-vscode';

// API相关常量
export const API_CONSTANTS = {
    BASE_URL: 'https://codeforces.com/api',
    METHODS: {
        USER_INFO: 'user.info',
        CONTEST_LIST: 'contest.list',
        PROBLEM_SET: 'problemset.problems',
        SUBMISSION_LIST: 'problemset.submissions',
    },
    TIMEOUT: 10000, // 10秒
    MAX_RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1秒
};

// 存储键名常量
export const STORAGE_KEYS = {
    USER_INFO: 'userInfo',
    API_KEY: 'apiKey',
    API_SECRET: 'apiSecret',
    LAST_LOGIN: 'lastLogin',
    SETTINGS: 'settings',
};

// 命令ID常量
export const COMMANDS = {
    LOGIN: `${EXTENSION_ID}.login`,
    LOGOUT: `${EXTENSION_ID}.logout`,
    CHECK_STATUS: `${EXTENSION_ID}.checkStatus`,
    SWITCH_ACCOUNT: `${EXTENSION_ID}.switchAccount`,
    SET_API_KEY: `${EXTENSION_ID}.setApiKey`,
    RESET_API_KEY: `${EXTENSION_ID}.resetApiKey`,
    VALIDATE_API_KEY: `${EXTENSION_ID}.validateApiKey`,
    OPEN_SETTINGS: `${EXTENSION_ID}.openSettings`,
    RESET_SETTINGS: `${EXTENSION_ID}.resetSettings`,
};

// 配置项常量
export const CONFIG = {
    DEFAULT_TIMEOUT: 10000,
    DEFAULT_NOTIFICATION_DURATION: 5000,
    MIN_NOTIFICATION_DURATION: 1000,
    MAX_NOTIFICATION_DURATION: 20000,
};

// 状态栏常量
export const STATUS_BAR = {
    PRIORITY: 100,
    LOGGED_IN_TEXT: '$(check) CF',
    LOGGED_OUT_TEXT: '$(x) CF',
    ERROR_TEXT: '$(error) CF',
    SYNCING_TEXT: '$(sync~spin) CF',
    TOOLTIP: {
        LOGGED_IN: 'Codeforces: Logged in',
        LOGGED_OUT: 'Codeforces: Click to login',
        ERROR: 'Codeforces: Error occurred',
        SYNCING: 'Codeforces: Syncing...',
    },
};

// 错误消息常量
export const ERROR_MESSAGES = {
    API_KEY_REQUIRED: 'API Key is required',
    API_SECRET_REQUIRED: 'API Secret is required',
    HANDLE_REQUIRED: 'Handle is required',
    INVALID_CREDENTIALS: 'Invalid credentials',
    NETWORK_ERROR: 'Network error occurred',
    SERVER_ERROR: 'Server error occurred',
    TIMEOUT_ERROR: 'Request timed out',
    UNKNOWN_ERROR: 'Unknown error occurred',
};

// 成功消息常量
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    SETTINGS_RESET: 'Settings have been reset',
    API_KEY_UPDATED: 'API key has been updated',
};

// 提示消息常量
export const INFO_MESSAGES = {
    CHECKING_STATUS: 'Checking login status...',
    VALIDATING_KEY: 'Validating API key...',
    SWITCHING_ACCOUNT: 'Switching account...',
};

// 正则表达式常量
export const REGEX = {
    HANDLE: /^[a-zA-Z0-9_]{3,24}$/,
    API_KEY: /^[a-fA-F0-9]{32}$/,
    API_SECRET: /^[a-fA-F0-9]{32}$/,
};

// 本地化常量
export const LOCALE = {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'zh-cn', 'ru'],
};

// WebView相关常量
export const WEBVIEW = {
    TITLE: 'Codeforces',
    TYPE: {
        PROBLEM: 'problem',
        CONTEST: 'contest',
        SUBMISSION: 'submission',
    },
}; 