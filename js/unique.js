// indexOf去重，速度第二，对象和 NaN 不去重
function unique(array) {
    var arr = [];
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (arr.indexOf(item) === -1) {
            arr.push(item);
        }
    }
    return arr;
}

// filter去重，对象不去重 NaN 会被忽略掉
function unique2(array) {
    return array.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
}

// hash去重，对象不去重 NaN 去重
function unique4(array) {
    var arr = [];
    var hash = {};
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        var key = typeof item + item;
        if (hash[key] !== 1) {
            arr.push(item);
            hash[key] = 1;
        }
    }
    return arr;
}
// 排序后去重，对象和 NaN 不去重
function unique5(array) {
    array.sort();
    var arr = [array[0]];
    for (var i = 1; i < array.length; i++) {
        if (array[i] !== arr[arr.length - 1]) {
            arr.push(array[i]);
        }
    }
    return arr;
}
// ES6 Set去重，速度最快，对象不去重 NaN 去重
function unique6(array) {
    return Array.from(new Set(array));
}

var arr = [];
var num = 0;
for (var i = 0; i < 1000000; i++) {
    num = Math.floor(Math.random() * 100);
    arr.push(num);
}
arr = [1, 3, 2, 1, null, 4, 5, 2, 4, 1, '1', 'a', 'A', 'a', null, NaN, NaN];

console.time('test');
let result = unique(arr.slice());
console.log('test', result);
console.timeEnd('test');

console.time('test2');
result = unique2(arr.slice());
console.log('test2', result);
console.timeEnd('test2');

console.time('test4');
result = unique4(arr.slice());
console.log('test4', result);
console.timeEnd('test4');

console.time('test5');
result = unique5(arr.slice());
console.log('test5', result);
console.timeEnd('test5');

console.time('test6');
result = unique6(arr.slice());
console.log('test6', result);
console.timeEnd('test6');
