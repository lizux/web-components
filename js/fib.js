'use strict';
// 原始，纯递归
function fibonacci(n) {
    count++;
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}
// 统计原始运行次数
function times(n) {
    if (n < 2) {
        return 1;
    }
    return 1 + times(n - 1) + times(n - 2);
}

// 尾递归
function tailFibonacci(n, result = 0, next = 1) {
    count++;
    if (n === 0) {
        return result;
    }
    return tailFibonacci(n - 1, next, result + next);
}

// 递归(自上而下) + 缓存
let cacheFibonacci = (() => {
    let cache = {};
    return function (n) {
        if (cache[n]) {
            return cache[n];
        }
        count++;
        if (n < 2) {
            return n;
        }
        cache[n] = cacheFibonacci(n - 1) + cacheFibonacci(n - 2);
        return cache[n];
    };
})();

/*
一般动态规划指的是狭义上动态规划, 狭义的动态规划指的是通过递推实现的.
广义的动态规划不局限与编程形式, 可以是递归, 也可以是递推.

广义的动态规划包含了记忆化搜索与狭义的动态规划.

记忆化搜索 vs 动态规划

两者本质上是一样的, 都有边界条件, 状态转移方程.
区别:
1 记忆化搜索的编程模式是递归, 而动态规划的编程模式是递推.
2 记忆化搜索是自顶而下, 从目标状态到边界条件, 而动态规划是自底而上, 从边界条件到目标状态.
3 记忆化搜索不需要严格设计好计算顺序, 而动态规划必须严格设计好计算顺序.
4 多个状态下, 动态规划通常会生成大量无效的状态, 而记忆化搜索不会, 这是记忆化搜索速度上, 有可能超越动态规划的点.

动态规划是一种迭代解决递归性质问题的技术，适用于子问题的计算重复情况。另外用记忆的方法也可以防止重复计算子问题。
可以说动态规划问题可以用递归来解决，但是递归的问题不一定可以用动态规划解决。
*/

// 递推/动态规划(自下而上) + 迭代
function loopFibonacci(n) {
    let dp = [0, 1];
    count = 1;
    for (let i = 2; i <= n; i++) {
        count++;
        // 状态转移方程
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 递推/动态规划 + 结构赋值
function loopFibonacciAdv(n) {
    let [a, b] = [1, 0];
    count = 1;
    while (n > 0) {
        count++;
        n--;
        [a, b] = [a + b, a];
    }
    return b;
}

// 递推/动态规划 + 迭代
function loopFibonacciUltra(n) {
    if (n <= 0) {
        return 0;
    }
    count = 1;
    let first = 0,
        second = 1,
        next;
    for (let i = 2; i <= n; i++) {
        count++;
        next = first + second;
        first = second;
        second = next;
    }
    return second;
}

// 递推法 解决 爬楼梯问题（每次可以爬 1 或 2 个台阶。有多少种不同的方法可以爬到楼顶）
function climbStairs(n) {
    let dp = [0, 1, 2];
    count = 1;
    for (let i = 3; i <= n; i++) {
        count++;
        dp[i] = dp[i - 2] + dp[i - 1];
    }
    return dp[n];
}

function testRun(n, tests) {
    tests.forEach((item) => {
        count = 0;
        console.time(item.name);
        let result = item.fn(n);
        console.timeLog(item.name);
        console.log('运行次数 = ', count);
        console.log('结果 = ', result);
        console.log('=====');
    });
}

let count = 0;
let testList = [
    {
        name: '原始方法',
        fn: fibonacci
    },
    {
        name: '尾递归',
        fn: tailFibonacci
    },
    {
        name: '缓存递归',
        fn: cacheFibonacci
    },
    {
        name: '递推方法',
        fn: loopFibonacci
    },
    {
        name: '高级递推1',
        fn: loopFibonacciAdv
    },
    {
        name: '高级递推2',
        fn: loopFibonacciUltra
    }
];
testRun(40, testList);
// 性能：cacheFibonacci > loopFibonacciUltra > tailFibonacci > loopFibonacci > loopFibonacciAdv > fibonacci
