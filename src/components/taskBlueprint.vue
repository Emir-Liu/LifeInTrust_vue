<template>
    <h1>任务蓝图</h1>
    <div>
        蓝图在这里显示
    </div>

    <div>
        这里是任务列表相关的操作，添加删除任务等
        <br>
        <br>
        <button @click="addTask">
            添加任务
        </button>
        <button @click="delTask">
            删除任务
        </button>
        <button @click="addSubTask">
            添加子任务
        </button>
    </div>

    <br>
    <br>

    <div class="taskList">
        这里是任务列表
    
        <a-tree
            class="draggable-tree"
            draggable
            block-node
            :tree-data="treeData"
            @dragenter="onDragEnter"
            @drop="onDrop"
            @select="onSelect"
        />
    </div>
    <div>
        这里是对任务的配置
        <div v-if="showAddTask">
            任务名称：
            <a-input v-model:value="addTaskName" placeholder="输入任务名称" />

            <div v-if="addTaskParent">
                父任务名称:{{ addTaskParent }}
            </div>
            


            <button @click="confirmAddTask(addTaskParent)">确认添加任务</button>
        </div>
        <div v-else>
            <br>
            <br>
            请安排你的任务
        </div>

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

let addTaskName = ref('')

let addTaskParent = ref('')

let selectTaskKey = ref('')


let showAddTask = ref(false)

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
function updateTaskTree() {
    api_request.TaskBlueprint.list(data_params).then((rets:any) => {
        const org_data = rets.data.task_tree
        console.log('org_data:',org_data)
        mapTreeData(org_data, keymapping);
        rootTaskID = org_data.key
        treeData.value = org_data.children
        console.log('treeData:', org_data.children)

    })
}

updateTaskTree();

// console.log('treeData1:', treeData.value)

type TreeDataItem = TreeProps['treeData'][number];


const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log('DragEnter:',info);
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
};

const onDrop = (info: AntTreeNodeDropEvent) => {

    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const drop_params = {
        'task_id': dragKey,
        'parent_task_id': dropKey,
    }

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

function onSelect(selectedKeys: any,e: any) {
    console.log('onSelect')
    console.log('selectedKeys:', selectedKeys)
    console.log('e:',e)
    selectTaskKey.value = e.node.key
    // addTaskParent.value = e.node.parent_task_id

    showAddTask.value = false
}

function cleanSelect() {

}

function addTask(){
    console.log('addTask')
    showAddTask.value = true
    addTaskParent.value = ''
    console.log('addTaskParent.value:',addTaskParent.value)
    selectTaskKey.value = ''
    addTaskName.value = ''
}

function addSubTask(){
    console.log('addSubTask')
    if (selectTaskKey.value != '') {
        addTaskParent.value = selectTaskKey.value
        showAddTask.value = true
        console.log('addTaskParent.value:',addTaskParent.value)
        addTaskName.value = ''
    }
    else {
        console.log('没有选择子任务')
    }
}

function delTask(){
    console.log('delTask')
    if (selectTaskKey.value != '') {
        const params = {
            'task_id': selectTaskKey.value
        }
        api_request.TaskBlueprint.delete(params).then(() => {
            console.log('成功删除任务')
            updateTaskTree()
            selectTaskKey.value = ''
        }

        )
    }
}


function confirmAddTask(parent_task_id:string){
    console.log('confirmAddTask')
    console.log('taskname:', addTaskName.value)
    console.log('parent_task_id:',parent_task_id)
    if (parent_task_id === '') {
        console.log('parent_task_id === ')
        parent_task_id = rootTaskID
    }
    if (addTaskName.value != '') {
        const params = {
            'task_name': addTaskName.value,
            'parent_task_id': parent_task_id,
            'user_id':''
        }
        console.log('params:',params)
        api_request.TaskBlueprint.add(params).then(() => {
            console.log('添加任务成功')
            updateTaskTree();
            showAddTask.value = false
            // selectTaskKey.value = ''
        }
        )
    }
}

</script>
  
  

<style scoped>
</style>