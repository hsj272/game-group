import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/car' },
    { path: '/car', name: 'CarEvents', component: () => import('@/views/car/Events.vue') },
    { path: '/car/game', name: 'GameCar', component: () => import('@/views/car/GameCar.vue') },
  ],
})

export default router
