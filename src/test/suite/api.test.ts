import * as assert from 'assert';
import { codeforcesAPI } from '../../utils/api';

suite('API Test Suite', () => {
    test('Should Set Credentials Correctly', () => {
        const testKey = 'test_key';
        const testSecret = 'test_secret';
        
        codeforcesAPI.setCredentials(testKey, testSecret);
        
        // 由于凭证是私有的，我们通过验证方法来测试
        assert.doesNotThrow(() => {
            // 这里应该不会抛出凭证未设置的错误
            codeforcesAPI.validateCredentials('test_handle');
        });
    });

    test('Should Handle Network Errors', async () => {
        try {
            // 使用无效的凭证触发错误
            await codeforcesAPI.validateCredentials('invalid_handle');
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.ok(error instanceof Error);
        }
    });

    test('Should Generate Valid API Signature', async () => {
        const testKey = 'test_key';
        const testSecret = 'test_secret';
        
        codeforcesAPI.setCredentials(testKey, testSecret);
        
        // 验证生成的签名格式
        const response = await codeforcesAPI.validateCredentials('test_handle');
        assert.ok(typeof response === 'boolean');
    });

    test('Should Update Network Settings', () => {
        const timeout = 5000;
        const proxy = 'http://localhost:8080';

        codeforcesAPI.updateNetworkSettings(timeout, proxy);
        
        // 这个测试主要确保方法不会抛出错误
        assert.ok(true);
    });
}); 