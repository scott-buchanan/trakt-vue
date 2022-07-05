import { createRouter, createWebHistory } from 'vue-router';
import tvDetails from '@/views/tv-details.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "TV" */ '../views/tv.vue'),
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import(/* webpackChunkName: "TV" */ '../views/tv.vue'),
  },
  {
    path: '/tv/:show/season/:season/episode/:episode',
    name: 'details',
    components: { default: tvDetails },
    props: { default: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
