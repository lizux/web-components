Vue + Element 开发注意事项

0. Vue规范

	组件属性
	
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

	标签属性
	
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

	命名规范

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

0. 常用静态常量尽量从组件里面提取到公共组件，统一管理

0. 设置别名，简化导入组件的路径

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

0. 因为vue data 初始化时不能嵌套定义（一个对象的属性值指向另外一个值），所以有类似需求用字符串来指定属性名，同时还能解决延迟加载的数据问题

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
	```

0. 路由链接尽量通过 name 来设置而非直接对 url 硬编码

	```html
	- <router-link :to="`/global/cloud_services/${scope.row.primary_id}`">
	链接
	</router-link>
	
	+ <router-link :to="{name: 'cloudDetail', params: {cloudID: scope.row.primary_id}}">
	链接
	</router-link>
	```
	
	```javascript
	{
	    path: ':cloudID',
	    name: 'cloudDetail',
	    component: CloudDetail,
	    props: true
	}
	```
0. 路由链接会提前预解析，导致 vue-router 的警告“missing param for named route”，加 v-if 判断修复

	```javascript
	<router-link v-if="appID" :to="{name: 'appMember'}">
	    Member
	</router-link>
	```

0. 路由组件通过特殊设置来对参数解耦

	原始的路由设置：
	
	```javascript
	// vue-router
	{
        path: ':userID',
        component: UserDetail
    }
    // UserDetail
    data: function() {
        return {
            currentUser: this.$route.params.userID
        };
    },
    ```
    
    修改后的路由设置：
    
    ```javascript
    // vue-router
    {
        path: ':userID',
        component: UserDetail,
        props: true
    }
    // UserDetail
    props: {
        userID: {
            type: String,
            required: true
        }
    },
    ```
    
    更复杂的用法：
    
    ```javascript
    {
	    path: 'member',
	    name: 'companyMember',
	    component: CommonMember,
	    props: route => ({
	        resourceID: route.params.companyID,
	        resourceType: 'company'
	    })
	}
	```
0. 组件提炼为公共组件后会有缓存问题：添加 key 值，避免翻页后缓存造成不渲染的问题

	```javascript
	<el-table-column label="Title">
	    <template slot-scope="scope">
	-        <record-title :detail-data="scope.row"></record-title>
	+        <record-title :detail-data="scope.row" :key="scope.row.time"></record-title>
	    </template>
	</el-table-column>
	```

0. 组件提炼为公共组件后会有缓存问题：通过 router 加 key 避免复用组件不刷新的问题，会有副作用：内部组件不会缓存会重复刷新，改用 watch 方法实现

	```javascript
	- <router-view :key="$route.path"></router-view>
	+ <router-view></router-view>
	+
	watch: {
	    resourceType: function(newValue) {
	        this.init();
	    }
	}
```
0. 组件嵌套模板导致内部 this 指向非当前 vm 实例的问题：重新绑定 this

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
0.  使用 tab 组件时要优化性能，避免重复渲染

	```javascript
	<el-tab-pane v-for="tabScope in tabList" :key="tabScope.key" :label="tabScope.label" :name="tabScope.key">
	-   <hi-form :fields="currentFields[activeTab] || []" :model="realAppDetail" :rules="ruleList" :self="_self"></hi-form>
	</el-tab-pane>
	+   <hi-form :fields="currentFields[activeTab] || []" :model="realAppDetail" :rules="ruleList" :self="_self"></hi-form>
	```

0. 表单初始值的问题:
	multiselect、 file 类型必须设置初始值为空数组，否则报错
	checkbox 初始值必须为空数组，否则无法实现多选
	
	```javascript
	domains: [],
	google_account_name: []
	```
0. 表单静态渲染项也得加 prop 属性，否则校验程序不生效；同时还得设置 rules 属性

	```javascript
	- <el-form-item v-if="mode === 'view'" :key="field.key" :label="field.label" class="static-form-item">
	+ <el-form-item v-if="mode === 'view'" :key="field.key" :label="field.label" :prop="field.key" :rules="[]" class="static-form-item">
	```
0. 去除表单原生的 required 属性，避免重复校验

	```javascript
	- <el-form-item label="Role" prop="role_name" required>
	+ <el-form-item label="Role" prop="role_name">
	```

0. upload 组件实现限制大小

	目标：要在选择文件而非提交表单时实现限制大小功能
	过程：因为没有 ```before-change``` 钩子函数，所以只能用 ```on-change``` 事件，在检测到文件超过限制时，调用 ```clearFiles()``` 方法
	> 注：在 v-for 循环中 upload 组件的 ref 会变成一个数组，而不是单个对象，即使该 ref 值是唯一值，所以需要特别处理 [0] 才能访问

0. upload 组件实现返回信息在 file list 中显示

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

0. input 组件支持回车事件

	Element 的 input 组件没有实现 keyup 事件，所以要监听回车事件必须使用 ```@keyup.native.enter=''``` 形式


0. multiselect 组件被禁用的选项不能被移除

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
0. date 组件实现日期范围限制

	```
	<el-date-picker type="date" v-model="formData[field.key]" :picker-options="dateLimit" value-format="yyyy-MM-dd"></el-date-picker>
	
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

0. 在 element 的 event 事件中增加自定义参数

	如果你直接在方法中写，他就会将原生内置的参数覆盖！
	
	但是你可以在自定义参数之前加入 ```$event``` 这个变量，然后再传其他值，这样的话事件的内置回调参数就会保留了。
	
	例如：
	
	```
	<el-select v-model="formData[field.key]" multiple @remove-tag="handleRemoveTag($event, field)">
	```

0. 在把 vue 向父级传参方式由 传统 改为 $emit 时要注意：

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

0. 升级 element ui v2.4+，记得同时引入 <el-scrollbar> 避免 Table 组件打开筛选列表时报错

	```
	import {
	    Scrollbar
	} from 'element-ui';
	
	Vue.component(Scrollbar.name, Scrollbar);
	```
0. 升级 element ui 2.4.4，要注意：修复了 filter 的一个 bug，需要 filter-method 和 filters 同时设置才能开启 filter 功能
