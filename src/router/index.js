import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/2',
            name: 'welcome',
            component: () => import('../pages/WelcomePage/index.vue')
        },
        {
            path: '/',
            // path: '/work',
            name: 'workbenches',
            component: () => import('../pages/WorkBenches/index.vue')
        }
    ]
})

export default router
