/**
 * Codeforces Advanced Template
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

// 常用常量
const int MOD = 1e9 + 7;
const int INF = 0x3f3f3f3f;
const ll LLINF = 0x3f3f3f3f3f3f3f3fLL;
const double PI = acos(-1.0);
const double EPS = 1e-9;

// 快速幂
template<typename T>
T power(T a, ll b, T m = MOD) {
    T res = 1;
    while (b > 0) {
        if (b & 1) res = (res * a) % m;
        a = (a * a) % m;
        b >>= 1;
    }
    return res;
}

// 最大公约数
template<typename T>
T gcd(T a, T b) {
    return b ? gcd(b, a % b) : a;
}

// 最小公倍数
template<typename T>
T lcm(T a, T b) {
    return a / gcd(a, b) * b;
}

// 组合数模板
struct Combination {
    vector<ll> fac, inv, finv;
    Combination(int n) : fac(n + 1), inv(n + 1), finv(n + 1) {
        fac[0] = fac[1] = 1;
        inv[1] = 1;
        finv[0] = finv[1] = 1;
        FOR(i, 2, n + 1) {
            fac[i] = fac[i - 1] * i % MOD;
            inv[i] = MOD - MOD / i * inv[MOD % i] % MOD;
            finv[i] = finv[i - 1] * inv[i] % MOD;
        }
    }
    ll C(int n, int k) {
        if (n < k || k < 0) return 0;
        return fac[n] * finv[k] % MOD * finv[n - k] % MOD;
    }
};

// 并查集模板
struct UnionFind {
    vector<int> d;
    UnionFind(int n = 0): d(n, -1) {}
    int find(int x) {
        return d[x] < 0 ? x : d[x] = find(d[x]);
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (d[x] > d[y]) swap(x, y);
        d[x] += d[y];
        d[y] = x;
        return true;
    }
    bool same(int x, int y) { return find(x) == find(y); }
    int size(int x) { return -d[find(x)]; }
};

// 线段树模板
template<typename T>
struct SegmentTree {
    vector<T> data;
    int n;
    SegmentTree(int size) {
        n = 1;
        while (n < size) n *= 2;
        data.assign(2 * n - 1, T());
    }
    void update(int k, T a) {
        k += n - 1;
        data[k] = a;
        while (k > 0) {
            k = (k - 1) / 2;
            data[k] = data[k * 2 + 1] + data[k * 2 + 2];
        }
    }
    T query(int a, int b, int k = 0, int l = 0, int r = -1) {
        if (r < 0) r = n;
        if (r <= a || b <= l) return T();
        if (a <= l && r <= b) return data[k];
        T vl = query(a, b, k * 2 + 1, l, (l + r) / 2);
        T vr = query(a, b, k * 2 + 2, (l + r) / 2, r);
        return vl + vr;
    }
};

// 树状数组模板
template<typename T>
struct BIT {
    vector<T> bit;
    int n;
    BIT(int size) : n(size + 1), bit(size + 1, 0) {}
    void add(int i, T x) {
        for (++i; i < n; i += i & -i) bit[i] += x;
    }
    T sum(int i) {
        T s = 0;
        for (++i; i > 0; i -= i & -i) s += bit[i];
        return s;
    }
    T sum(int l, int r) { return sum(r) - sum(l - 1); }
};

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