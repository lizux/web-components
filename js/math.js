function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

function isInteger1(n) {
    return typeof n === 'number' && n % 1 === 0;
}

function isInteger2(target) {
    let num = target - 0;
    return Math.floor(num) === num;
}

let a = 1.0;
let b = NaN;
let c = Infinity;
let d = '10';
let e = 3.0000000000000002;

console.log(isInteger(a), isInteger1(a), isInteger2(a));
console.log(isInteger(b), isInteger1(b), isInteger2(b));
console.log(isInteger(c), isInteger1(c), isInteger2(c));
console.log(isInteger(d), isInteger1(d), isInteger2(d));
console.log(isInteger(e), isInteger1(e), isInteger2(e));

let a1 = '1.01.45';
let b1 = '';
let c1 = 'num123';
let d1 = '123num';
let e1 = null;

function toNumber(value) {
    return Number(value) + '==' + parseFloat(value);
}

console.log(toNumber(a1));
console.log(toNumber(b1));
console.log(toNumber(d1));
console.log(toNumber(d1));
console.log(toNumber(e1));
