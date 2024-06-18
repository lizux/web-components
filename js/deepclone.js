// 测试深度复制

function deepClone(target, cache = new WeakMap()) {
    if (cache.get(target)) {
        return cache.get(target);
    }
    if (!target || typeof target !== 'object') {
        return target;
    }
    let clone;
    if (Array.isArray(target)) {
        clone = [];
    } else if (typeof target === 'function') {
        clone = function () {
            return target.call(this, ...arguments);
        };
    } else if (target instanceof RegExp) {
        clone = new RegExp(target.source, target.flags);
    } else if (target instanceof Date) {
        clone = new Date(target);
    } else if (target instanceof Set) {
        clone = new Set(target);
    } else if (target instanceof Map) {
        clone = new Map(target);
    } else {
        clone = Object.create(Object.getPrototypeOf(target));
    }
    // 将属性和拷贝后的值作为一个 map
    cache.set(target, clone);
    Object.keys(target).forEach((key) => {
        clone[key] = deepClone(target[key], cache);
    });
    return clone;
}
function cloneDeep(target) {
    return structuredClone(target);
}

function TestPerson(name) {
    this.name = name;
}
const testMap = new Map();
testMap.set('key', 'value');
testMap.set('show', 'name');
const testSet = new Set();
testSet.add('show');
testSet.add('name');

let targetObj = {
    field1: [{a: 2}, {a: 4}, {a: 8}],
    field2: {
        child: 'child'
    },
    field3: /\d+/,
    field4: undefined,
    field5: null,
    field6: NaN,
    field7: Infinity,
    num: new Number(2),
    str: new String(2),
    arr: new Array(1),
    bool: new Boolean(true),
    date: new Date(),
    reg: new RegExp('ab+c', 'i'),
    map: testMap,
    set: testSet,
    symbol: Object(Symbol(1)),
    error: new Error(),
    person: new TestPerson('Messi'),
    func: function (a, b) {
        return a + b;
    },
    func2: () => {
        console.log('hi');
    }
};
Object.defineProperties(targetObj, {
    one: {enumerable: true, value: 'one'},
    two: {enumerable: false, value: 'two'}
});
targetObj = Object.create(targetObj, Object.getOwnPropertyDescriptors(targetObj));
targetObj.loop = targetObj;

let cloneObj = deepClone(targetObj);
cloneObj.field1.testProp = 123;
cloneObj.field1[1].a = 1;
cloneObj.field2.child = 'cool';
cloneObj.map.set('a', 123);
cloneObj.set.add('zero');

function testFunc() {
    console.log('目标对象', targetObj);
    console.log('复制对象', cloneObj);

    // 无法复制函数
    console.log(cloneObj.func, targetObj.func);
    // 无法复制日期对象
    console.log(cloneObj.date, targetObj.date);
    // 无法复制正则对象
    console.log(cloneObj.reg, targetObj.reg);
    // 稀疏数组复制错误
    console.log(cloneObj.arr[0], targetObj.arr[0]);
    // 构造函数指向错误
    console.log(cloneObj.person.constructor, targetObj.person.constructor);

    console.log(cloneObj.field1, targetObj.field1);
    console.log(cloneObj.field2.child, targetObj.field2.child);
}
testFunc();

function createData(deep, breadth) {
    let data = {};
    let temp = data;
    for (let i = 0; i < deep; i++) {
        temp = temp['data'] = {};
        for (let j = 0; j < breadth; j++) {
            temp[j] = j;
        }
    }
    return data;
}
function runTime(fn, time) {
    let stime = Date.now();
    let count = 0;
    while (Date.now() - stime < time) {
        fn();
        count++;
    }
    return count;
}
let clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};
let test = runTime(function () {
    clone(createData(1000, 5));
}, 1000);
console.log('time = ', test);
