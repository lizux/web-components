# Vue + Element 开发注意事项

## Vue规范

### 组件属性

```
    name
    components
    model
    data
    props
    computed
    watch

    beforeCreate
    created
    beforeMount
    mounted
    beforeUpdate
    updated
    beforeDestroy
    destroyed

    methods
    template
```

### 标签属性

```
    is
    v-for
    v-if
    v-else-if
    v-else
    v-show
    v-once
    id
    ref
    key
    slot
    v-bind
    v-model
    ...其他属性
    v-on
```

### 命名规范

```
'current' + Name：当前操作对象或变量
'real' + Name：经过处理才能使用的对象或变量
```

列表：

```
name + 'List'：用于直接定义的静态列表
name + 'Data'：用于接口返回的数据列表
name + 's'   ：用于组件的属性，比较简练
```

## Vue 技巧

### Vue-cli 打包出的 app.js 在 safari 下刷新也获取不到最新版本（也不是上个版本，奇怪的顺序）

解决方案：

```javascript
chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
    config
        .output
        .filename('[name].[hash].js')
        .end()
    }
}
// 或
devServer: {
    watchOptions: {
        poll: true
    }
}
```

### 设置别名，简化导入组件的路径

```javascript
- import HiForm from 'components/hiform';
- import {requiredInput, requiredSelect} from 'components/constant';

+ import HiForm from '@/hiform';
+ import {requiredInput, requiredSelect} from '@/constant';

// webpack.config.js
alias: {
    '@': path.join(APP_PATH, 'components')
}
```

### 在 vue 里当图片采用背景图片显示方案时，需要在 url 里面加入引号避免路径包含空格时造成无法显示图片的 bug

```javascript
let src = 'http://sample.com/show me.jpg';
- :style="{'background-image':`url(${src})`}"
+ :style="{'background-image':`url('${src}')`}"
```

### 因为 vue 的 data 初始化时不能嵌套定义（一个对象的属性值指向另外一个值），所以有类似需求用字符串来指定属性名，同时还能解决延迟加载的数据问题

```javascript
data: function() {
    return {
        toggleList: [
            {
                label: 'API',
                key: 'api'
            },
            {
                label: 'Server',
                key: 'server'
            },
            {
                label: 'Permission',
                key: 'permission'
            },
            {
                label: 'Git',
                key: 'git_repo'
            }
        ],
        risk: {
            label: 'Risk Free',
            key: 'risk_free',
            type: 'radio',
            values: 'toggleList',
            valueMode: 'readonly'
        }
    };
}

// 使用时：
this.riskValues = this[this.risk.values]
```

### vue 的 v-for 语句会把内部 this 指向全局变量（一般为 undefined）；而非当前 vm 实例的问题：重新绑定 this

```javascript
<el-tabs v-model="activeTab">
    <el-tab-pane v-for="tabScope in tabList" :key="tabScope.key" :label="tabScope.label" :name="tabScope.key">
-        <hi-form :fields="currentFields" :model="realAppDetail" :rules="ruleList" :self="this"></hi-form>
+        <hi-form :fields="currentFields" :model="realAppDetail" :rules="ruleList" :self="_self"></hi-form>
    </el-tab-pane>
</el-tabs>

created() {
    this._self = this;
}
```

### 自定义组件复用后会有缓存问题：添加 key 值，避免翻页后缓存造成不渲染的问题

```javascript
<el-table-column label="Title">
    <template slot-scope="scope">
-        <record-title :detail-data="scope.row"></record-title>
+        <record-title :detail-data="scope.row" :key="scope.row.id"></record-title>
    </template>
</el-table-column>
```

### 路由链接尽量通过 name 来设置而非直接对 url 硬编码

```html
- <router-link :to="`/global/cloud_services/${scope.row.id}`">链接</router-link>

+ <router-link :to="{name: 'cloudDetail', params: {cloudID: scope.row.id}}">链接</router-link>
```

```javascript
{
    path: ':cloudID',
    name: 'cloudDetail',
    component: CloudDetail
}
```

### 路由链接会提前预解析，导致 vue-router 的警告“missing param for named route”，加 v-if 判断修复

```javascript
<router-link v-if="cloudID" :to="{name: 'cloudDetail'}">
    Member
</router-link>
```

### 路由组件通过特殊设置来对参数解耦

原始的路由设置：

```javascript
// vue-router
{
    path: ':cloudID',
    component: CloudDetail
}
// cloudDetail
data: function() {
    return {
        currentCloud: this.$route.params.cloudID
    };
}
```

修改后的路由设置：

```javascript
// vue-router
{
    path: ':cloudID',
    component: CloudDetail,
    props: true
}
// cloudDetail
props: {
    userID: {
        type: String,
        required: true
    }
}
```

更复杂的用法（props 传递更多参数）：

```javascript
// vue-router
{
    path: ':cloudID',
    component: CloudDetail,
    props: route => ({
        cloudID: route.params.cloudID,
        resourceType: 'company'
    })
}
```

### 对于 vue-router，在使用 beforeRouteLeave 导航守卫时，注意有坑！

问题描述：假如使用了确认离开对话框，在等待确认时，对 $router.back() 或者 $router.go() 等方法仍会改变浏览器的 location url，即使目标组件未渲染
解决方法：加入 next(false)

```javascript
beforeRouteLeave(to, from, next) {
    next(false); //必须加，否则在通过 goBack 触发等待确认时，url 已经改变为目标地址
    if (window.confirm('Do you really want to leave?')) {
        next();
    }
},
methods: {
    goBack() {
        this.$router.back();
    }
}
```

### 组件提炼为公共组件后会有缓存问题：通过 router 加 key 避免复用组件不刷新的问题，会有副作用：内部组件不会缓存会重复刷新，改用 watch 方法实现

```javascript
- <router-view :key="$route.path"></router-view>
+ <router-view></router-view>

+   watch: {
        resourceType: function(newValue) {
            this.init();
        }
    }
```

### 使用 keepAlive 缓存组件后，假如内部有嵌套路由，则不能同时开启多个子路由组件的 meta.keepAlive 属性，需要对嵌套的 router-view 再次包裹 keepAlive（可以使用 include 指定要缓存的组件）

```
<keep-alive include="MeetingSummary,MeetingDetail"><router-view></router-view></keep-alive>
```

### 使用 keepAlive 缓存组件后，由于组件一直在缓存中，所以其 watch 方法会一直调用，假如观察的是 route 参数，会频繁触发，注意性能优化！

### vue-router 的 beforeRouteUpdate 事件不会在 keepAlive 包裹组件里面触发

解决方法：可以使用 beforeRouteEnter 或 watch 解决（ [参考1](https://github.com/vuejs/vue-router/issues/1875) [参考2](https://github.com/vuejs/vue-router/issues/2255)）

## Element UI 技巧


### Carousel 图片轮播组件自定义

假如需要在浏览区外部显示箭头按钮，可以采用隐藏原生箭头，自定义箭头图标，并且调用原生的 prev/next 方法即可

### 修复 Carousel 图片轮播组件在容器缩放时，暴露相邻图片的 bug

解决方法：缩放开始时隐藏相关元素，结束后复原

```javascript
function hasClass(elem, name) {
    return elem.className.split(' ').indexOf(name) > -1;
}
let carousel = document.getElementsByClassName('el-carousel__item');
for (const item of carousel) {
    if (!hasClass(item, 'is-active')) {
        item.style.visibility = 'hidden';
    }
}
setTimeout(() => {
    for (const item of carousel) {
        if (!hasClass(item, 'is-active')) {
            item.style.visibility = 'visible';
        }
    }
}, 1000);
```

###  使用 tab 组件时要优化性能，避免重复渲染

```javascript
<el-tab-pane v-for="tabScope in tabList" :key="tabScope.key" :label="tabScope.label" :name="tabScope.key">
-   <hi-form :fields="currentFields[activeTab] || []" :model="realAppDetail" :rules="ruleList" :self="_self"></hi-form>
</el-tab-pane>
+   <hi-form :fields="currentFields[activeTab] || []" :model="realAppDetail" :rules="ruleList" :self="_self"></hi-form>
</el-tab-pane>
```

### 表单初始值的问题:
multiselect、 file 类型必须设置初始值为空数组，否则报错
checkbox 初始值必须为空数组，否则无法实现多选

```javascript
domains: [],
google_account_name: []
```

### 表单静态渲染项也得加 prop 属性，否则校验程序不生效；同时还得设置 rules 属性

```javascript
- <el-form-item :label="field.label" class="static-form-item">
+ <el-form-item :label="field.label" :prop="field.key" :rules="[]" class="static-form-item">
```

### 去除表单原生的 required 属性，避免重复校验

```javascript
- <el-form-item label="Role" prop="role_name" required>
+ <el-form-item label="Role" prop="role_name">
```

### 表单控件在某些场景下，仅需要实现 label 显示必填标识，但是又不需要提示校验信息的话（在父级 label 包含多个无label 的表单元素的情况：校验信息一般通过子元素来显示）

```javascript
<el-form-item label="父级" prop="parent" :show-message="false">
    <el-col :span="11">
        <el-form-item prop="children1">
        </el-form-item>
    </el-col>
    <el-col :span="2">&nbsp;</el-col>
    <el-col :span="11">
        <el-form-item prop="children2">
        </el-form-item>
    </el-col>
</el-form-item>
```

### upload 组件的事件冗余问题

当使用 before-upload 添加上传校验时，假如校验未通过会触发 on-remove 事件，造成事件冗余。可以在 on-remove 钩子函数中使用 file 的状态判断

```javascript
onRemove(file) {
    if (file && file.status === 'success') {
        // remove file
    }
}
```

### upload 组件实现限制大小

目标：要在选择文件而非提交表单时实现限制大小功能
过程：因为没有 `before-change` 钩子函数，所以只能用 `on-change` 事件，在检测到文件超过限制时，调用 `clearFiles()` 方法
> 注：在 v-for 循环中 upload 组件的 ref 会变成一个数组，而不是单个对象，即使该 ref 值是唯一值，所以需要特别处理 [0] 才能访问

### upload 组件实现返回信息在 file list 中显示

```
let fileList = document.getElementsByClassName(
    'el-upload-list'
)[0];
if (fileList) {
    let lists = fileList.getElementsByTagName('li');
    let clone = [].slice.call(lists);
    clone.forEach(item => {
        let anchor = item.getElementsByClassName(
            'el-upload-list__item-name'
        )[0];
        if (anchor) {
            let title = anchor.innerText;
            let errormsg = result.upload_error[title];
            let successmsg = result.upload_success[title];
            if (errormsg) {
                var txt = document.createTextNode(errormsg);
                var errorInfo = document.createElement(
                    'span'
                );
                errorInfo.appendChild(txt);
                this.$util.superClass(
                    errorInfo,
                    'add',
                    'alert'
                );
                this.$util.insertAfter(errorInfo, anchor);
            }
            if (successmsg) {
                this.$util.superClass(
                    item,
                    'add',
                    'is-success'
                );
            }
        }
    });
}
```

### input 组件支持回车事件

Element 的 input 组件没有实现 keyup 事件，所以要监听回车事件必须使用 ` @keyup.native.enter='' ` 形式


### multiselect 组件被禁用的选项不能被移除

```
<el-select v-model="formData[field.key]" multiple @remove-tag="handleRemoveTag(field)">
handleRemoveTag(field) {
    let oldValue = this.cloneData[field.key];
    let options = this.handleArrayData(field.values);
    let lock = [];
    options.forEach(item => {
        if (oldValue.indexOf(item.key) > -1) {
            if (this.isUnselect(field, item)) {
                lock.push(item.key);
            }
        }
    });
    if (lock.length) {
        let value = this.formData[field.key];
        this.formData[field.key] = this.$util.unique([
            ...lock,
            ...value
        ]);
    }
}
```

### date 组件实现日期范围限制

```
<el-date-picker type="date" v-model="formData[field.key]" :picker-options="dateLimit"></el-date-picker>

data: function() {
    return {
        dateLimit: {
            disabledDate: time => {
                let min = this.minDate;
                if (min && time < new Date(min)) {
                    return true;
                }
                if (time > Date.now()) {
                    return true;
                }
                return false;
            }
        }
    };
}
```

### 在 element 的 event 事件中增加自定义参数

如果你直接在方法中写，他就会将原生内置的参数覆盖！

但是你可以在自定义参数之前加入 `$event` 这个变量，然后再传其他值，这样的话事件的内置回调参数就会保留了。

例如：

```
<el-select v-model="formData[field.key]" multiple @remove-tag="handleRemoveTag($event, field)">
```

### 在把 vue 向父级传参方式由 传统 改为 $emit 时要注意：

传统方式：
```
父组件：
<package-detail :on-change="updateResult.bind(null, scope)"></package-detail> // 使用 bind 方法按需传入父级参数

updateResult(scope, result) {
    // 在父级参数之后读入 $emit 事件参数
}

子组件：
props:{
    // 对 props 的事件预设定可以移除（因为只针对变量属性而非事件属性）
    onChange: {
        type: Function
    }
}

this.onChange(result);
```

$emit方式：
```
父组件：
<package-detail @on-change="updateResult($event, scope)"></package-detail> // 使用 $event 传入 $emit 事件参数，然后按需传入父级参数

updateResult(result, scope) {
    // 在 $emit 事件参数之后读入父级参数
}

子组件：
this.$emit('on-change', result); // 调用事件的名称用 原始连字符写法 而非 驼峰式写法
```
