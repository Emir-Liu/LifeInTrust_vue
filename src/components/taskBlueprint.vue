<template>
    <h1>任务蓝图</h1>
    <div>
        蓝图在这里显示
    </div>

    <div class="taskList">
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

let rootTaskID = ''

const data_params = {
    'task_id': ''
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
    console.log('org_data:',org_data)
    mapTreeData(org_data, keymapping);
    rootTaskID = org_data.key
    treeData.value = org_data.children
    console.log('treeData:', org_data.children)
})

// console.log('treeData1:', treeData.value)

type TreeDataItem = TreeProps['treeData'][number];


const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log('DragEnter:',info);
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
};

const onDrop = (info: AntTreeNodeDropEvent) => {
    console.log('Drop:',info);



    // api_request.TaskBlueprint update()

    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const org_dropPosition = info.dropPosition
    const minus = Number(dropPos[dropPos.length - 1])
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const drop_params = {
        'task_id': dragKey,
        'parent_task_id': dropKey,
    }

    // console.log('dropKey:', dropKey)
    // console.log('dragKey:', dragKey)
    // console.log('dropPos:', dropPos)
    console.log('dropPosition(-1表示移动到目标节点上面，1表示移动到目标节点下面，0表示移动到目标节点的子节点):', dropPosition)
    console.log('被拖拽节点:', info.dragNode.title )
    console.log('拖拽到节点:', info.node.title)
    // console.log('org drop position', org_dropPosition)
    // console.log('minus:', minus)
    console.log('drop to gap是否移到子节点(false为移动到子节点，true表示同级):', info.dropToGap)
    // // 推拽到根节点下
    // if (dropPosition == -1) {
    //     drop_params.parent_task_id = rootTaskID
    // }
    // // if ()
    // dropPosition:-1表示移动到目标节点上面，1表示移动到目标节点下面，0表示移动到目标节点的子节点
    // 对第一层child节点下面的节点进行操作
    if(dropPosition == -1){
        drop_params.parent_task_id = info.node.parent_task_id
    }
    if(dropPosition == 0){
        drop_params.parent_task_id = info.node.key
    }
    if(dropPosition == 1){
        drop_params.parent_task_id = info.node.parent_task_id
    }
    api_request.TaskBlueprint.update(drop_params)


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
        console.log('移动到非顶级组的第一个位置')
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
        console.log('不知大')
        loop(data, dropKey, (item: TreeDataItem) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
        });
    } else {
        console.log('平移，交叉')
        console.log('other')
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