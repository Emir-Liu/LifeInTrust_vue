<template>
    <h1>任务蓝图</h1>
    <div>
        蓝图在这里显示
    </div>

    <div>
        这里是任务列表
    
        <a-tree
            class="draggable-tree"
            draggable
            block-node
            :tree-data="treeData"
            @dragenter="onDragEnter"
            @drop="onDrop"
        />
    </div>
    <div>
        这里是对任务的配置
    </div>
 </template>


<script lang="ts" setup>

// get tree data from backend
import api_request from '@/util/api';
import type {
    AntTreeNodeDragEnterEvent,
    AntTreeNodeDropEvent,
    TreeProps
} from 'ant-design-vue/es/tree';
import { ref } from 'vue';

const rootId = '739b1d69-0b87-4b72-a7f1-3790594777b0'

const data_params = {
    'task_id':rootId
}
const treeData = ref<TreeProps['treeData']>();

const keymapping = {
    id:'key',
    name:'title',
    child_task:'children'
}
function mapTreeData(node:any, mapping: any){
    if (!node) return [];

    Object.keys(mapping).forEach(key => {
        // console.log('node:',node)
        // console.log('key:',key)
        // console.log('node key:', node[key])
        if (node[key] !== undefined) {
            node[mapping[key]] = node[key];
            delete node[key];
        }
    });

    if (node.children && node.children.length) {
        node.children.forEach((child:any) => mapTreeData(child, mapping));
    }
}
// const 
api_request.TaskBlueprint.list(data_params).then((rets:any) => {
    const org_data = rets.data.task_tree
    // console.log('org_data:',org_data)
    mapTreeData(org_data, keymapping);
    
    treeData.value = org_data.children
    console.log('treeData:', org_data.children)
    console.log('len:', treeData.value?.length)
})

console.log('treeData1:', treeData.value)

type TreeDataItem = TreeProps['treeData'][number];


const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log('DragEnter:',info);
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
};

const onDrop = (info: AntTreeNodeDropEvent) => {
    console.log('Drop:',info);
    const params = {
        'task_id':info.dragNode.key,
        'parent_task_id':info.node.key,
    }

    // find act root
    if (info.node.parent?.key == rootId && info.dropToGap == true) {
        params.parent_task_id = rootId
    }
    console.log('update info:',params);
    api_request.TaskBlueprint.update(
        params
    ).then()

    console.log('parent Id:',params.parent_task_id)
    console.log('task id:', params.task_id)
    console.log('dropToGap:', info.dropToGap)
    

    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
        data.forEach((item, index) => {
            if (item.key === key) {
                return callback(item, index, data);
            }
            if (item.children) {
                return loop(item.children, key, callback);
            }
        });
    };
    const data = [...treeData.value];

    // Find dragObject
    let dragObj: TreeDataItem;
    loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
        arr.splice(index, 1);
        dragObj = item;
    });
    if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item: TreeDataItem) => {
            item.children = item.children || [];
            /// where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
        });
    } else if (
        (info.node.children || []).length > 0 && // Has children
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
    ) {
        loop(data, dropKey, (item: TreeDataItem) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
        });
    } else {
        let ar: TreeProps['treeData'] = [];
        let i = 0;
        loop(data, dropKey, (_item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
            ar = arr;
            i = index;
        });
        if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
        } else {
            ar.splice(i + 1, 0, dragObj);
        }
    }
    treeData.value = data;
};
</script>
  
  

<style scoped>
</style>