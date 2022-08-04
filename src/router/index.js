import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from '@/store/index';
import trakt from '@/api/trakt';

const routes = [
  {
    path: '/',
    redirect: '/tv',
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import(/* webpackChunkName: "TV" */ '../views/tv.vue'),
  },
  {
    path: '/tv/:show/season/:season/episode/:episode',
    name: 'episode-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/episode-details.vue'),
  },
  {
    path: '/tv/:show',
    name: 'show-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/show-details.vue'),
  },
  {
    // 404
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useStore();
  const urlParams = new URLSearchParams(window.location.search);
  let authTokens;

  if (localStorage.getItem('trakt-vue-token')) {
    // if local storage has tokens, get the accessToken from the refreshToken
    const tokens = JSON.parse(localStorage.getItem('trakt-vue-token'));
    authTokens = await trakt.getTokenFromRefresh(tokens.refreshToken, to.path);
    localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    store.updateTokens(authTokens);
  } else if (urlParams.get('code')) {
    // if no tokens were present and we fell into the else, we get redirected
    // with query: code and put tokens into local storage
    authTokens = await trakt.getToken(urlParams.get('code'));
    localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    store.updateTokens(authTokens);
    next({ name: to.name, query: null });
  } else {
    window.location = // eslint-disable-line
      'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
  }

  const myInfo = await trakt.getTraktSettings(authTokens.accessToken);
  store.updateMyInfo(myInfo);

  next();
});

export default router;
