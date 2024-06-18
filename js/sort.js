// 冒泡排序
function bubbleSort(target) {
    let arr = target.slice();
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]];
            }
        }
    }
    return arr;
}
// 快排演示版，使用了 filter 方法
function quickSort(target) {
    let array = target.slice();
    if (array.length < 2) {
        return array;
    }
    let center = Math.round(array.length / 2);
    let pivot = array[center];
    let left = array.filter((v, i) => v <= pivot && i !== center);
    let right = array.filter((v) => v > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

// 快速排序 by Russ_Zhong
function quickSort2(target) {
    let arr = target.slice();
    let left = 0,
        right = arr.length - 1;
    // console.time('QuickSort');
    main(arr, left, right);
    // console.timeEnd('QuickSort');
    return arr;
    function main(arr, left, right) {
        // 递归结束的条件，直到数组只包含一个元素。
        if (arr.length === 1) {
            // 由于是直接修改arr，所以不用返回值。
            return;
        }
        // 获取left指针，准备下一轮分解。
        let index = partition(arr, left, right);
        if (left < index - 1) {
            // 继续分解左边数组。
            main(arr, left, index - 1);
        }
        if (index < right) {
            // 分解右边数组。
            main(arr, index, right);
        }
    }
    // 数组分解函数。
    function partition(arr, left, right) {
        // 选取中间项为参考点。
        let pivot = arr[Math.floor((left + right) / 2)];
        // 循环直到left > right。
        while (left <= right) {
            // 持续右移左指针直到其值不小于pivot。
            while (arr[left] < pivot) {
                left++;
            }
            // 持续左移右指针直到其值不大于pivot。
            while (arr[right] > pivot) {
                right--;
            }
            // 此时左指针的值不小于pivot，右指针的值不大于pivot。
            // 如果left仍然不大于right。
            if (left <= right) {
                // 交换两者的值，使得不大于pivot的值在其左侧，不小于pivot的值在其右侧。
                [arr[left], arr[right]] = [arr[right], arr[left]];
                // 左指针右移，右指针左移准备开始下一轮，防止arr[left]和arr[right]都等于pivot然后导致死循环。
                left++;
                right--;
            }
        }
        // 返回左指针作为下一轮分解的依据。
        return left;
    }
}

let generateArray = function (length) {
    let arr = Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = Math.random();
    }
    return arr;
};

let demo = generateArray(10000);
console.log('origin == ', demo[0]);

console.time('normal');
let result = bubbleSort(demo);
console.timeEnd('normal');

console.time('quick');
let result0 = quickSort(demo);
console.timeEnd('quick');

console.time('quick2');
let result1 = quickSort2(demo);
console.timeEnd('quick2');

console.log('1 == ', result[0]);
console.log('2 == ', result0[0]);
console.log('3 == ', result1[0]);

console.log('last origin == ', demo[0]);
