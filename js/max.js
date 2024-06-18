/*
let arr = [
    {
        age: 313,
    },
    {
        age: 23,
    },
    {
        age: 4,
    },
    {
        age: 345,
    },
    {
        age: 123,
    },
    {
        age: 65765,
    },
    {
        age: 23123,
    },
    {
        age: 34,
    },
];

// Max

let clone = arr.slice();
clone.sort((a, b) => {
    return b.age - a.age;
});
console.log(34, clone[0]);

let result = arr.reduce((max, next) => {
    return max.age > next.age ? max : next;
});
console.log(39, result);

let result2 = {};
arr.forEach((next) => {
    if (!result2.age || result2.age < next.age) {
        result2 = next;
    }
});
console.log(47, result2);

// Proxy
function observeAdv(obj, callback) {
    return new Proxy(obj, {
        get(target, key) {
            return target[key];
        },
        set(target, key, value) {
            let success = Reflect.set(target, key, value);
            if (success) {
                callback(key, value);
            }
            return success;
        },
    });
}

let result3 = Reflect.apply(Math.round, null, [1.35]);
console.log(66, result3);
let target = {
    name: 'shanshan',
    sex: '男',
};
let obj = observeAdv(target, (key, value) => {
    console.log(`属性[${key}]的值被修改为[${value}]`);
});

obj.name = 'cool';
obj.sex = 'female';
obj.news = 123;

console.log(79, target, obj);
*/

let Person = function (name, age, sex) {
    this.name = name;
    this.age = age;
    this.sex = sex;
    this.action = function () {
        console.log(this.name + this.age);
    };
};
Person.prototype.b = 3;

var person1 = new Person('tom', 18, 'male');
var person2 = Object.create(person1);
person2.name = 'sam';

console.log(96, Reflect.ownKeys(person1));
console.log(97, person1.__proto__, Person.prototype);
console.log(98, person1.b, person1.hasOwnProperty('b'));
console.log(99, person2.__proto__);
console.log(100, person2.constructor.name);

let person3 = new person2.constructor('john', 24, 'female');
console.log(104, person3);
