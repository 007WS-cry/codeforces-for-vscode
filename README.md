# Codeforces for VS Code

这是一个用于在 VS Code 中参与 Codeforces 竞赛和练习的扩展。

## 功能特性

### 竞赛管理
- 查看竞赛列表（所有/即将开始/正在进行）
- 竞赛详情查看
- 竞赛注册
- 题目列表浏览
- 实时状态更新
- 排名查看

### 测试用例管理
- 本地测试用例存储
- 样例输入/输出验证
- 批量测试运行
- 测试结果分析
- 性能数据统计

### 难度系统
- 题目难度显示
- 难度趋势分析
- 难度分布统计
- 推荐难度计算
- 进度可视化

### 通知系统
- 竞赛开始提醒
- 竞赛结束提醒
- 状态变更通知
- 排名变更通知
- 自定义提醒时间

### 账号管理
- 登录/登出
- 账号切换
- 自动登录
- 登录状态检查

### API 配置
- API Key 设置
- API 密钥验证
- 请求超时设置
- 代理配置

## 使用方法

### 安装
1. 在 VS Code 扩展商店中搜索 "Codeforces for VS Code"
2. 点击安装
3. 重启 VS Code

### 登录
1. 使用快捷键 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS) 打开命令面板
2. 输入 "Codeforces: Login" 并执行
3. 输入您的 Codeforces 账号和密码

### 竞赛功能
- `Ctrl+Shift+C` (Windows/Linux) 或 `Cmd+Shift+C` (macOS): 打开竞赛命令面板
- 查看竞赛列表: `Codeforces: Show Contest List`
- 查看即将开始的竞赛: `Codeforces: Show Upcoming Contests`
- 查看正在进行的竞赛: `Codeforces: Show Active Contests`
- 注册竞赛: 在竞赛详情页面点击 "Register" 按钮
- 查看题目: 在竞赛详情页面点击 "Show Problems" 按钮

### 测试功能
- 运行测试: `Codeforces: Run Test Case`
- 验证测试: `Codeforces: Validate Test Cases`
- 查看结果: 在输出面板中查看详细结果
- 性能分析: 查看执行时间和内存使用

### 难度功能
- 查看难度: `Codeforces: Show Problem Difficulty`
- 查看趋势: `Codeforces: Show Difficulty Trend`
- 难度统计: 在状态栏查看当前难度
- 进度追踪: 通过图表查看进步情况

## 配置选项

### 竞赛配置
```json
{
  "codeforces-for-vscode.contest": {
    "autoRefresh": true,           // 自动刷新竞赛列表
    "refreshInterval": 300,        // 刷新间隔（秒）
    "notifications": {
      "enabled": true,            // 启用通知
      "beforeStart": [15, 5, 1],  // 开始前提醒时间（分钟）
      "beforeEnd": [15, 5, 1],    // 结束前提醒时间（分钟）
      "statusChange": true,       // 状态变更通知
      "rankingChange": true       // 排名变更通知
    },
    "cache": {
      "maxAge": 600              // 缓存有效期（秒）
    }
  }
}
```

### 认证配置
```json
{
  "codeforces-for-vscode.auth": {
    "autoLogin": false,          // 自动登录
    "rememberMe": true          // 记住登录状态
  }
}
```

### 网络配置
```json
{
  "codeforces-for-vscode.network": {
    "timeout": 10000,           // 请求超时时间（毫秒）
    "proxy": {
      "enabled": false,         // 启用代理
      "url": ""                // 代理服务器地址
    }
  }
}
```

## 快捷键

| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 打开命令面板 | `Ctrl+Shift+C` | `Cmd+Shift+C` |
| 刷新竞赛列表 | `Ctrl+R` | `Cmd+R` |
| 显示帮助 | `Ctrl+Shift+H` | `Cmd+Shift+H` |
| 运行测试 | `Ctrl+Alt+T` | `Cmd+Alt+T` |

## 问题反馈

如果您遇到任何问题或有功能建议，请在 [GitHub Issues](https://github.com/WS007-cry/codeforces-for-vscode/issues) 页面提交。

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Pull Request 来改进这个项目！

## 更新日志

### 0.0.1
- 初始版本发布
- 基本的竞赛管理功能
- 通知系统
- 账号管理
- API 配置