import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // 测试插件的根目录
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        
        // 测试文件所在的目录
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // 下载VS Code，解压并运行测试
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ['--disable-extensions']
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main(); 