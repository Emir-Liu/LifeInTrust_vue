<template>
    <h1>导航栏</h1>
    <div>
        <ul>
            <li v-for="nav_item in navList" :key="nav_item.name" @click="navicateTo(nav_item.name)">
                <div>
                    {{ nav_item.name }}
                </div>
                
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
console.log('router:',router)

const routerList = router.options.routes
console.log('routerList:',routerList)
const navList = routerList.filter(navItem => navItem.name !== undefined);

function navicateTo(name: string){
    console.log('点击导航按钮',name)
    router.push({name: name})
}
</script>

<style scoped> 
</style>


  
  