# 异步构造函数 - 构造函数与Promise的结合


拜浏览器和Node.js的更新所赐, async函数这几年变得越来越常见, 我们在实例化一个类的时候可能也会要先异步执行一些操作. 拿一个最简单的延迟初始化的类作例子, 来自其他语言的编程习惯会使我们下意识这么写:

```javascript
function delay(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

class MyClass {
  constructor() {
    this.completed = false
  }

  async init(timeout) {
    await delay(timeout)
    this.completed = true
  }
}
```

这样的类需要用两行代码完成实例化和异步初始化:

```javascript

;(async () => {
  const a = new MyClass()
  await a.init(5000)
  console.log(a.completed) // true
})()
```

上面的代码并没有什么不方便, 只是new和init分成了两个步骤而已, 但是完美主义者依然会觉得不爽——为什么我们不能把代码写成下面这样呢:

```javascript

;(async () => {
  const a = await new MyClass(5000)
  console.log(a.completed) // true
})()
```

这个语句看起来有点怪异, 很多人都没有见过, 但它确实是符合语法的. new操作符会先执行, 在完成对A类的实例化后, 再将A类的实例进行异步初始化, 最终await接收到的异步返回值是已经被异步初始化完毕的实例.

要想让这个语句能够成功执行, 我们需要改造MyClass.

## 实现原理
让MyClass能够支持异步构造函数, 有两种方法, 首先看最简单的第一种方法:

```javascript

class MyClass {
  constructor(timeout) {
    this.completed = false

    return (async () => {
      await delay(timeout)
      this.completed = true

      return this
    })()
  }
}
```

我们知道JavaScript的class其实是语法糖, 所以上面的代码翻译过来其实是这样的:

```javascript

function MyClass(timeout) {
  this.completed = false

  return (async () => {
    await delay(timeout)
    this.completed = true

    return this
  })()
}
```

MyClass是一个普通函数, 在用new操作符创建对象时, 它会起到构造函数的作用. 在JavaScript里, 如果不显示指定构造函数的返回值, 它会默认返回创建的实例本身, 也就是运行时的this, 如果指定了返回值, 这个返回值会替代默认值. 所以在这段代码里, 我们用一个立即执行的异步箭头函数作为返回值, 实际上返回的是一个Promise实例, 这个Promise在resolve时才会将创建的对象实例(this)返回, 于是我们外部的await就得到了完成异步构造后的实例.

在TypeScript等自称是JavaScript"超集"或者"方言"的语言里, 你可能无法使用第一种方法实现相同的功能, 因为它们的class构造函数可能不支持返回值或返回不同类型的值. 不过好在JavaScript是一个多范式语言, 我们仍然有别的方法实现相同的效果, 第二种方法便应运而生, 对于不同的语言, 只要将其翻译成不同的语法就可以了.

第二种方法也并没有复杂多少, 让我们先看代码:

```javascript

class MyClass {
  constructor(timeout) {
    this.completed = false

    const init = (async () => {
      await delay(timeout)
      this.completed = true

      delete this.then
      return this
    })()

    this.then = init.then.bind(init)
  }
}
```

和之前代码的不同之处在于, 这种方法为MyClass的实例添加了then方法. then方法在这种异步构造函数里扮演了关键角色, 我们知道async/await是基于Promise实现的, await操作符会起到调用then方法的作用, 我们往MyClass里添加then方法的目的, 就是让await操作符能够像操作Promise实例那样操作MyClass的实例, 使其成为一个PromiseLike对象, 这就实现了不在constructor里覆盖返回值, 却又能用await new的效果. MyClass的then方法的值则是async函数的运行结果, 为了让init的then方法能够在外部调用时正常使用, 我们用bind方法绑定了它的this, 在这个系列的上一篇文章《异步Proxy - Proxy与Promise的结合》里我们也做过一样的事情.

接下来看我们真正的主角, init函数...其实这样说是错误的, 这里的init是一个立即调用的异步箭头函数的返回值, 为了文章最开头的代码对应起来, 所以也使用了init作为名字. "init函数"与之前的init方法的不同之处有两行:

```javascript
delete this.then
return this
```

最后一行的语句return this是很好理解的, 与前一种异步构造函数不同, 它是一种链式调用的结果, 在then方法调用完毕后, 它也会把MyClass的实例作为返回值返回, async函数运行完毕即意味着异步初始化完毕, 所以最后await操作符得到的结果就是我们已经完成异步初始化的类实例了.

delete this.then的主要作用是清理掉这个实例上的then方法, 这也是很好理解的, 就像构造函数不可能再被执行一遍一样, 当我们的异步初始化完成, then方法很可能永远不会再被调用(即使再调用它, 异步初始化函数也不会再执行一次, 它只有确保初始化函数被执行完毕的作用), 所以哪怕出于代码洁癖, 删掉它也合情合理. 除了这个表面上的原因, 还有一个更加关键的原因迫使我们必须执行删除操作, 你可以尝试运行下面这段去除了此行的代码:

```javascript
function delay(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

class MyClass {
  constructor(timeout) {
    this.completed = false

    const init = (async () => {
      await delay(timeout)
      this.completed = true

      return this
    })()

    this.then = init.then.bind(init)
  }
}

;(async () => {
  const a = await new MyClass(5000) // pending...
  console.log(a.completed)
})()
```
你不会在5秒后看到输出, 为什么? 因为return this使代码形成链式调用, 由于await操作符(或者说Promise.then)的特性, 会变成无限进行下去的then调用循环, 导致永远无法返回出结果.

再回过头来看await delay(timeout)这一行, 如果你把这一行转变成同步代码, 比如直接去掉, 会发生什么事?

```javascript
function delay(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

class MyClass {
  constructor(timeout) {
    this.completed = false

    const init = (async () => {
      this.completed = true

      delete this.then
      return this
    })()

    this.then = init.then.bind(init)
  }
}

;(async () => {
  const a = await new MyClass(5000)
  console.log(a.completed) // ?
})()
```
你的一颗CPU核心会被占满.

造成这种情况的原因是async函数体在不存在await操作符的情况下, 会退化成() => Promise.resolve(this)的形式同步执行. 这导致了在运行delete this.then的时候this.then根本还没有赋值, 删除了一个不存在的成员等于什么都没删除, 所以这实际上是上一个问题的同步版本.

第二种异步构造函数的一个额外的特性是它的new和await是分离的, 在第一种异步构造函数里, 我们用new创建出的对象是隐藏的, 只有经过await才能拿到, 而在第二种异步构造函数中, 我们可以在new之后在外部先同步执行一些操作, 所以虽然混乱, 但运行像这样的代码是可行的:

```javascript
function delay(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

class MyClass {
  constructor(timeout) {
    this.progress = 0

    const init = (async () => {
      this.progress = 25
      await delay(timeout)
      this.progress = 100

      delete this.then
      return this
    })()

    this.then = init.then.bind(init)
  }
}

;(async () => {
  const a = new MyClass(0)
  console.log(a.progress) // 25
  a.progress = 50
  console.log(a.progress) // 50
  await a
  console.log(a.progress) // 100
})()
```javascript

当然, 没有人会推荐你写这样的代码.

重新思考第二种异步构造函数
下面给出了第二种异步构造函数最小化形式的模板, 你可以把它套用在你需要实现异步构造函数的类上.

```javascript
constructor() {
  const init = (async () => {
    delete this.then
    return this
  })()
  this.then = init.then.bind(init)
}
```javascript
出于分割delete this.then的考虑, 你还可以把这个语句移到then方法里:

```javascript
constructor() {
  const init = (async () => {
    return this
  })()
  this.then = (...args) => {
    delete this.then
    return init.then(...args)
  }
}
```javascript

随着对这个结构的深入, 发挥你的想象, 你会发现还有一种比第一种异步构造函数看起来还要"奇怪"的写法.

异步构造基类: 更好的使用方式
对于第二种异步构造函数, 我们可以把它编写成基类, 这种方式相比直接编写第二种异步构造函数要安全得多, 同时也比第一种异步构造方式看起来更接近其他编程语言的习惯(毕竟当初加入class关键字就是为了这个目的), 不需要手动编写return this. 除了自己编写基类, 你也可以在async-constructor找到我已经做好的模块.

基类形式非常简单, 我们只需要在最小化形式上进行扩展即可:

```javascript
class AsyncConstructor {
  constructor(asyncConstructor) {
    const init = (async () => {
      await asyncConstructor()
      delete this.then
      return this
    })()
    this.then = init.then.bind(init)
  }
}
```
在使用时, 继承AsyncConstructor类, 将异步箭头函数作为基类的参数传入super:

```javascript
function delay(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

class MyClass extends AsyncConstructor {
  constructor(timeout) {
    super(async () => {
      await delay(timeout)
      this.completed = true
    })

    this.completed = false
  }
}

;(async () => {
  const a = await new MyClass(5000)
  console.log(a.completed) // true
})()
```

之所以说这种方式让第二种异步构造函数更加安全, 是因为在这种使用方式里, 你的"init函数"内永远有await操作符, 即使你传入的是一个同步函数, 它也不会出现上面提到的问题. 此外, 在往super里传入参数时, 我们还能额外获得来自运行时的错误检查: 在大多数情况下我们需要在异步构造函数里修改this的成员, 若你传入的是一个同步函数, 而这个同步函数里又用到了this, 运行时将直接爆出错误ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor, 原因是我们的基类此时还没有构造完成. 相反, 在传入async函数的情况下, 基类已经构造完成了, 使用起来就没有任何问题, 通过这种方式, 可使开发人员避免在此编写同步代码.
