import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "TV" */ '../views/TvView.vue'),
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import(/* webpackChunkName: "TV" */ '../views/TvView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
