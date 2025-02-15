import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
    // 创建 Mocha 实例
    const mocha = new Mocha({
        ui: 'tdd',           // 使用 TDD 风格的测试接口
        color: true,         // 启用彩色输出
        timeout: 10000,      // 测试超时时间（毫秒）
        reporter: 'spec'     // 使用详细的测试报告器
    });

    // 获取测试文件根目录
    const testsRoot = path.resolve(__dirname, '..');

    try {
        // 使用 glob.sync 来同步查找文件
        const files = glob.sync('**/**.test.js', { cwd: testsRoot });

        // 添加所有测试文件到 Mocha
        files.forEach(f => {
            mocha.addFile(path.resolve(testsRoot, f));
        });

        // 运行测试
        return new Promise<void>((resolve, reject) => {
            try {
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        throw err;
    }
}
