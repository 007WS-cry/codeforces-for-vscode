// 获取 VS Code API
const vscode = acquireVsCodeApi();

// DOM 元素
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const contentElement = document.getElementById('content');

// MathJax 配置
window.MathJax = {
    tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
    },
    startup: {
        typeset: false
    }
};

// 状态管理
let currentState = {
    isLoading: false,
    error: null,
    problem: null
};

// 显示/隐藏加载状态
function setLoading(isLoading) {
    currentState.isLoading = isLoading;
    loadingElement.classList.toggle('active', isLoading);
}

// 显示错误信息
function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.add('active');
}

// 隐藏错误信息
function hideError() {
    errorElement.classList.remove('active');
    errorElement.textContent = '';
}

// 更新内容
function updateContent(content) {
    contentElement.innerHTML = content;
    
    // 重新渲染数学公式
    if (window.MathJax) {
        window.MathJax.typesetPromise && window.MathJax.typesetPromise();
    }
}

// 处理复制样例
function handleCopySample(sampleId) {
    const sample = document.querySelector(`.sample[data-sample-index="${sampleId}"]`);
    if (sample) {
        const input = sample.querySelector('.sample-input code').textContent;
        vscode.postMessage({
            type: 'copySample',
            data: { text: input }
        });
    }
}

// 设置主题
function setTheme(theme) {
    document.body.setAttribute('data-vscode-theme-kind', theme);
}

// 消息处理
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'updateContent':
            if (message.data.isLoading !== undefined) {
                setLoading(message.data.isLoading);
            }
            
            if (message.data.content) {
                hideError();
                updateContent(message.data.content);
            }
            
            if (message.data.problem) {
                currentState.problem = message.data.problem;
            }
            break;

        case 'themeChanged':
            setTheme(message.data.theme);
            break;

        case 'error':
            setLoading(false);
            showError(message.data.message);
            break;
    }
});

// 事件委托处理点击事件
document.addEventListener('click', event => {
    // 处理复制按钮点击
    if (event.target.classList.contains('copy-button')) {
        const sampleId = event.target.dataset.sampleId;
        handleCopySample(sampleId);
    }
});

// 初始化主题
setTheme(document.body.getAttribute('data-vscode-theme-kind') || 'light');

// 错误处理
window.addEventListener('error', event => {
    showError(`Error: ${event.message}`);
    vscode.postMessage({
        type: 'error',
        data: { message: event.message }
    });
});

// 处理未捕获的 Promise 错误
window.addEventListener('unhandledrejection', event => {
    showError(`Promise Error: ${event.reason}`);
    vscode.postMessage({
        type: 'error',
        data: { message: event.reason.toString() }
    });
}); 