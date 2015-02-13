// 获取所有下级节点，执行当前节点的操作
function toggleChild(obj, isChecked) {
    $(obj).find('input:checkbox').each(function() {
        if (this.checked != isChecked) {
            this.checked = isChecked;
        }
    });
}
// 若选中当前节点，则获取同级别的节点列表，若选中状态一致，则递归赋值父级节点；若取消选中当前节点，则递归赋值父级节点。
function toggleParent(obj, isChecked) {
    if (obj) {
        var input = $(obj).children('label').find('input:checkbox');
        if (input.prop('checked') != isChecked) {
            input.prop('checked', isChecked);
        }
        var parentNode = $(obj).parents('li');
        if (parentNode.length > 0) {
            parentNode = parentNode.eq(0);
            var allChecked = isChecked;
            if (allChecked == true) {
                parentNode.children('ul').children('li').each(function() {
                    var elem = $(this).children('label').find('input:checkbox');
                    if (elem.prop('checked') == false) {
                        allChecked = false;
                        return false;
                    }
                })
            }
            toggleParent(parentNode, allChecked);
        };
    }
}
