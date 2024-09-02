import taskBlueprint from "@/components/taskBlueprint.vue"
import taskProcess from "@/components/taskProcess.vue"
import taskReview from "@/components/taskReview.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
    {
        path: '/task_blueprint',
        name: '任务蓝图',
        component: taskBlueprint,
    },
    {
        path: '/task_process',
        name: '任务进度',
        component: taskProcess,
    },
    {
        path: '/task_review',
        name: '任务总结',
        component: taskReview,
    },
    {
        path: '/',
        redirect: 'task_blueprint'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
// export routes