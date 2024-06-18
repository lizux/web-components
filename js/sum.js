'use strict';
function sum(n) {
    count++;
    if (n < 0) {
        return 0;
    }
    return n + sum(n - 1);
}

// 递推法
function loopSum(n) {
    let result = 0;
    let next = 0;
    for (let i = 0; i <= n; i++) {
        count++;
        result = next;
        next += i + 1;
    }
    return result;
}

// 尾递归
function tailSum(n, total = 0) {
    count++;
    if (n <= 0) {
        return total;
    }
    return tailSum(n - 1, n + total);
}

let loop = 5000;
let result;
let count = 0;

console.time('origin');
count = 0;
result = sum(loop);
console.timeEnd('origin');
console.log('运行次数 == ', count);
console.log('结果 == ', result);
console.log('-----');

console.time('use loop');
count = 0;
result = loopSum(loop);
console.timeEnd('use loop');
console.log('运行次数 == ', count);
console.log('结果 == ', result);
console.log('-----');

console.time('use tail');
count = 0;
result = tailSum(loop);
console.timeEnd('use tail');
console.log('运行次数 == ', count);
console.log('结果 == ', result);
console.log('-----');
