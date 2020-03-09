<template>
    <ul>
        <li v-for="item in treeData" :key="item.id">
            {{item.menuName}}
            <tree v-if="item.children&&item.children.length" :tree-data="item.children"></tree>
        </li>
    </ul>
</template>
<script>
export default {
    name: 'Tree',
    props: {
        treeData: Array,
        default: () => []
    }
};
</script>
