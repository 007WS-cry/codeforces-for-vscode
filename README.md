# Codeforces for VSCode

VSCode 的 Codeforces 插件，让你可以直接在 VSCode 中参与 Codeforces 比赛和练习。

## 功能特性

- **账号管理**
  - Codeforces 账号登录/登出
  - API 密钥管理
  - 多账号切换支持

- **比赛功能**
  - 实时比赛列表
  - 比赛倒计时提醒
  - 自动加入已注册比赛
  - 比赛题目列表
  - 实时排名监控

- **题目功能**
  - 题目内容渲染（支持数学公式）
  - 测试用例管理
  - 代码模板支持
  - 样例验证
  - 难度标签显示

- **代码提交**
  - 一键提交代码
  - 多文件提交支持
  - 自动语言检测
  - 提交历史记录
  - 自动重试机制

## 系统要求

- VS Code 1.80.0 或更高版本
- Node.js 18.x 或更高版本
- 有效的 Codeforces 账号和 API 密钥

## 安装

在 VS Code 扩展市场中搜索 "Codeforces for VSCode" 并安装，或者：

1. 打开 VS Code
2. 按 `Ctrl+P` 打开命令面板
3. 输入 `ext install WS007-cry.codeforces-for-vscode`

## 配置说明

### API 配置

```json
{
"codeforces-for-vscode.auth.autoLogin": true,
"codeforces-for-vscode.auth.rememberMe": true
}
```

### 认证配置

```json
json
{
"codeforces-for-vscode.auth.autoLogin": true,
"codeforces-for-vscode.auth.rememberMe": true
}
```

### 网络配置

```json
json
{
"codeforces-for-vscode.network.timeout": 10000,
"codeforces-for-vscode.network.proxy.enabled": false,
"codeforces-for-vscode.network.proxy.url": ""
}
```


## 使用方法

1. **登录账号**
   - 使用命令面板 (`Ctrl+Shift+P`)
   - 输入 `Codeforces: Login`
   - 按提示输入 API 密钥和用户名

2. **查看比赛**
   - 在侧边栏打开 Codeforces 视图
   - 查看当前进行中和即将开始的比赛
   - 点击比赛可查看详情

3. **提交代码**
   - 打开要提交的代码文件
   - 使用命令面板或快捷键提交
   - 实时查看提交状态

## 常见问题

1. **API 密钥获取**
   - 访问 [Codeforces Settings](https://codeforces.com/settings/api)
   - 在 API 密钥部分生成新的密钥

2. **提交失败**
   - 检查网络连接
   - 验证 API 密钥是否有效
   - 确认文件格式是否正确

3. **比赛功能无法使用**
   - 确保已经注册相应的比赛
   - 检查比赛是否在进行中
   - 验证账号权限

## 更新日志

请查看 [CHANGELOG.md](CHANGELOG.md) 获取详细更新信息。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- GitHub Issues: [提交问题](https://github.com/WS007-cry/codeforces-for-vscode/issues)
- Email: [你的邮箱地址]

## 致谢

感谢所有贡献者和使用者的支持！