<template>
    <tree :tree-data="allTreeData"/>
</template>
<script>
import Tree from './tree';
export default {
    name: 'Root',
    components: {Tree},
    data() {
        return {
            allTreeData: [
                {
                    id: '1',
                    menuName: 'A',
                    children: [
                        {
                            menuName: 'a1',
                            id: '10'
                        },
                        {
                            menuName: 'a2',
                            id: '11'
                        }
                    ]
                },
                {
                    id: '2',
                    menuName: 'B',
                    children: [
                        {
                            menuName: 'b1',
                            id: '20'
                        },
                        {
                            menuName: 'b2',
                            id: '21'
                        }
                    ]
                }
            ]
        };
    }
};
</script>
