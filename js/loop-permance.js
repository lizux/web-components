// 测试迭代性能
const posts = [
    {id: 1, upVotes: 2},
    {id: 2, upVotes: 18},
    {id: 3, upVotes: 1},
    {id: 4, upVotes: 30},
    {id: 5, upVotes: 50},
];
let sum = 0;
console.time('reduce');
sum = posts.reduce((s, p) => (s += p.upVotes), 0);
console.timeEnd('reduce');
sum = 0;
console.time('for 循环');
for (let i = 0; i < posts.length; i++) {
    sum += posts[i].upVotes;
}
console.timeEnd('for 循环');
sum = 0;
console.time('for each');
posts.forEach((element) => {
    sum += element.upVotes;
});
console.timeEnd('for each');

// 可迭代对象
let arr = ['foo', 'bar'];
console.log(arr[Symbol.iterator]);

// 迭代器
let iter = arr[Symbol.iterator]();
console.log(iter);

// 执行迭代
console.log(iter.next()); // { done: false, value: 'foo' }
console.log(iter.next()); // { done: false, value: 'bar' }
console.log(iter.next()); // { done: true, value: undefined }
