/**
 * Codeforces Template
 * Created by Codeforces for VSCode Extension
 */

#include <bits/stdc++.h>
using namespace std;

// 常用类型别名
using ll = long long;
using ull = unsigned long long;
using pii = pair<int, int>;
using pll = pair<ll, ll>;
using vi = vector<int>;
using vll = vector<ll>;

// 常用宏定义
#define FOR(i, a, b) for (int i = (a); i < (b); ++i)
#define REP(i, n) FOR(i, 0, n)
#define FORD(i, a, b) for (int i = (b)-1; i >= (a); --i)
#define ALL(x) (x).begin(), (x).end()
#define SZ(x) (int)(x).size()
#define PB push_back
#define EB emplace_back
#define MP make_pair
#define FI first
#define SE second

// 调试宏
#ifdef LOCAL
#define debug(x) cerr << #x << " = " << (x) << endl
#else
#define debug(x) 42
#endif

// 常用常量
const int MOD = 1e9 + 7;
const int INF = 0x3f3f3f3f;
const ll LLINF = 0x3f3f3f3f3f3f3f3fLL;
const double PI = acos(-1.0);
const double EPS = 1e-9;

// 快速读入
template<typename T>
inline void read(T &x) {
    x = 0;
    bool neg = false;
    char c = getchar();
    while (c < '0' || c > '9') {
        if (c == '-') neg = true;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + c - '0';
        c = getchar();
    }
    if (neg) x = -x;
}

// 快速输出
template<typename T>
inline void write(T x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}

// 主函数
void solve() {
    // 在这里编写解决方案
    
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    
    int t = 1;
    cin >> t;  // 注释掉这行如果只有一个测试用例
    
    while (t--) {
        solve();
    }
    
    return 0;
} 