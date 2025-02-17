# Codeforces Template
# Created by Codeforces for VSCode Extension

import sys
import math
from collections import defaultdict, Counter, deque
from typing import List, Set, Dict, Tuple, Optional
from heapq import heappush, heappop, heapify

# 快速输入
input = lambda: sys.stdin.readline().rstrip()
ini = lambda: int(input())
inm = lambda: map(int, input().split())
inl = lambda: list(map(int, input().split()))
ins = lambda: input()

# 常用常量
MOD = 1000000007
INF = float('inf')
EPS = 1e-9

def solve():
    # 在这里编写解决方案
    pass

# 常用工具函数
def gcd(a: int, b: int) -> int:
    """计算最大公约数"""
    return a if b == 0 else gcd(b, a % b)

def lcm(a: int, b: int) -> int:
    """计算最小公倍数"""
    return a * b // gcd(a, b)

def power(a: int, b: int, m: int = MOD) -> int:
    """快速幂"""
    result = 1
    while b > 0:
        if b & 1:
            result = (result * a) % m
        a = (a * a) % m
        b >>= 1
    return result

def binary_search(arr: List[int], x: int) -> int:
    """二分查找"""
    left, right = 0, len(arr)
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < x:
            left = mid + 1
        else:
            right = mid
    return left

def main():
    t = 1
    t = ini()  # 注释掉这行如果只有一个测试用例
    
    for _ in range(t):
        solve()

if __name__ == "__main__":
    # 优化输入输出
    sys.setrecursionlimit(10**6)
    if sys.version_info[0] < 3:
        sys.stdin = io.StringIO(sys.stdin.read())
        sys.stdout = io.StringIO()
        print = sys.stdout.write
    
    main() 