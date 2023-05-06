import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: () => import('../pages/WelcomePage/index.vue')
        },
        {
            path: '/work',
            name: 'workbenches',
            component: () => import('../pages/WorkBenches/index.vue')
        },
        {
            path: '/run',
            name: 'runcase',
            component: () => import('../pages/RunCase/index.vue')
        },
        {
            path: '/screen',
            name: 'screen',
            component: () => import('../pages/ScreenPage/index.vue')
        },
        {
            path: '/node',
            name: 'node',
            component: () => import('../pages/NodePage/index.vue')
        }
    ]
})

export default router
