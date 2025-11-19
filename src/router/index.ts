import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/agreement',
      name: 'agreement',
      component: () => import('@/views/agreement/index.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/auth/index.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/chat/index.vue'),
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/create/index.vue'),
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('@/views/assets/index.vue'),
    },
    {
      path: '/nfc',
      name: 'nfc',
      component: () => import('@/views/nfc/index.vue'),
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('@/views/order/index.vue'),
    },
    {
      path: '/produce',
      name: 'produce',
      component: () => import('@/views/produce/index.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/user/index.vue'),
    },
  ],
})

export default router
