class Parent {
    constructor() {
        // 实例属性，优先级比原型高
        this.show = 'father';
        // 实例方法，优先级比原型高
        this.call = function () {
            console.log(7, this.show);
        };
    }
    // 原型方法
    act() {
        console.log(12, this.show);
    }
}
// 原型属性
Parent.prototype.show = 'papa';
// 静态属性
Parent.show = 'parent';

class Child extends Parent {
    constructor(name) {
        // 当方法调用时，调用的是父级的构造函数
        super();
        this.show = name;
    }
    act() {
        console.log(27, this.show);
        super.act();
    }
    call() {
        // 当对象访问时，访问的是父级原型上的属性或方法
        console.log(30, super.call);
        super.call();
    }
}

let parent = new Parent();
parent.act();
parent.call();

let son = new Child('son');
son.act();
son.call();
