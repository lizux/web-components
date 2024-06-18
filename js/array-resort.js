// 对数组排序并对指定项置顶

let arr = [
    {
        name: 'c',
    },
    {
        name: 'a',
    },
    {
        name: '1',
    },
    {
        name: 'bar',
    },
    {
        name: 'x',
    },
    {
        name: 'foo',
    },
    {
        name: 'default',
    },
];

function method1(arr) {
    let result = [];
    let first = arr.find((item) => {
        return item.name === 'default';
    });
    result = arr
        .filter((item) => {
            return item.name !== 'default';
        })
        .sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        });
    result.unshift(first);
    return result;
}

function method2(arr) {
    let first;
    let result = arr
        .reduce((result, item) => {
            if (item.name === 'default') {
                first = item;
            } else {
                result.push(item);
            }
            return result;
        }, [])
        .sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        });
    result.unshift(first);
    return result;
}

// 会改变原数组，同时 splice 性能不佳，不推荐使用
function method3(arr) {
    let result = arr.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
    });
    let index = result.findIndex((item) => {
        return item.name === 'default';
    });
    let first = result.splice(index, 1);
    return first.concat(result);
}

console.log('m1= ', method1(arr));
console.log('m2= ', method2(arr));
console.log('m3= ', method3(arr));
