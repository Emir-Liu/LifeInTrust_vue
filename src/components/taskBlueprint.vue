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
            :tree-data="gData"
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

const treeData = ref([])
const data_params = {
    'task_id':'c764656b684d4bd08827ca45057751c5'
}


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

api_request.TaskBlueprint.list(data_params).then((rets:any) => {
    const org_data = rets.data.task_tree
    // console.log('org_data:',org_data)
    mapTreeData(org_data, keymapping);
    
    treeData.value = org_data
    console.log('treeData:', treeData.value)
})



import type {
    AntTreeNodeDragEnterEvent,
    AntTreeNodeDropEvent,
    DataNode,
    TreeProps,
} from 'ant-design-vue/es/tree';
import { ref } from 'vue';

const x = 3;
const y = 2;
const z = 1;
const genData: DataNode[]=[];

// [
//     {
//         'key':'',
//         'title':'',
//         'children':[],
//     }
// ]

// generate tree data
const generateData = (_level: number, _preKey?: string, _tns?: TreeProps['treeData']) => {
    const preKey = _preKey || '0';
    const tns = _tns || genData;

    const children = [];
    for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({ title: key, key });
        if (i < y) {
            children.push(key);
        }
    }
    if (_level < 0) {
        return tns;
    }
    const level = _level - 1;
    children.forEach((key, index) => {
        tns[index].children = [];
        return generateData(level, key, tns[index].children);
    });
};
generateData(z);
type TreeDataItem = TreeProps['treeData'][number];
const gData = ref<TreeProps['treeData']>(genData);
// const newTreeData = ref<TreeProps['treeData']>(treeData);
// const gData = treeData.children
console.log('genData:',genData)
console.log('gData:',gData)
const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log(info);
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
};

const onDrop = (info: AntTreeNodeDropEvent) => {
    console.log(info);
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
    const data = [...gData.value];

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
    gData.value = data;
};
</script>
  
  

<style scoped>
</style>