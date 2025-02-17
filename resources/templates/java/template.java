/**
 * Codeforces Template
 * Created by Codeforces for VSCode Extension
 */

import java.io.*;
import java.util.*;

@SuppressWarnings("all")
public class template {
    static FastScanner fs = new FastScanner();
    static FastWriter fw = new FastWriter();
    static final int MOD = 1_000_000_007;
    static final int INF = Integer.MAX_VALUE;
    static final long LINF = Long.MAX_VALUE;
    static final double EPS = 1e-9;

    // 快速读入类
    static class FastScanner {
        BufferedReader br;
        StringTokenizer st;

        public FastScanner() {
            br = new BufferedReader(new InputStreamReader(System.in));
        }

        String next() {
            while (st == null || !st.hasMoreTokens()) {
                try {
                    st = new StringTokenizer(br.readLine());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return st.nextToken();
        }

        int nextInt() {
            return Integer.parseInt(next());
        }

        long nextLong() {
            return Long.parseLong(next());
        }

        double nextDouble() {
            return Double.parseDouble(next());
        }

        String nextLine() {
            String str = "";
            try {
                str = br.readLine();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return str;
        }

        int[] nextIntArray(int n) {
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                arr[i] = nextInt();
            }
            return arr;
        }

        long[] nextLongArray(int n) {
            long[] arr = new long[n];
            for (int i = 0; i < n; i++) {
                arr[i] = nextLong();
            }
            return arr;
        }
    }

    // 快速输出类
    static class FastWriter {
        BufferedWriter bw;

        public FastWriter() {
            bw = new BufferedWriter(new OutputStreamWriter(System.out));
        }

        public void print(Object obj) throws IOException {
            bw.write(obj.toString());
        }

        public void println(Object obj) throws IOException {
            print(obj);
            bw.newLine();
        }

        public void close() throws IOException {
            bw.close();
        }
    }

    // 解决方案
    public static void solve() throws IOException {
        // 在这里编写解决方案

    }

    public static void main(String[] args) throws IOException {
        int t = 1;
        t = fs.nextInt(); // 注释掉这行如果只有一个测试用例

        while (t-- > 0) {
            solve();
        }

        fw.close();
    }

    // 常用工具方法
    static int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    static long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    static int lcm(int a, int b) {
        return a / gcd(a, b) * b;
    }

    static long lcm(long a, long b) {
        return a / gcd(a, b) * b;
    }

    static int lower_bound(int[] arr, int x) {
        int l = 0, r = arr.length;
        while (l < r) {
            int m = l + (r - l) / 2;
            if (arr[m] >= x)
                r = m;
            else
                l = m + 1;
        }
        return l;
    }

    static int upper_bound(int[] arr, int x) {
        int l = 0, r = arr.length;
        while (l < r) {
            int m = l + (r - l) / 2;
            if (arr[m] > x)
                r = m;
            else
                l = m + 1;
        }
        return l;
    }

    static void sort(int[] arr) {
        Random rnd = new Random();
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int j = i + rnd.nextInt(n - i);
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        Arrays.sort(arr);
    }
}