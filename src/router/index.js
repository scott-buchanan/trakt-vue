import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from '@/store/index';
import {
  getTokenFromRefresh,
  getToken,
  getTraktSettings,
  getMyShowRatings,
  getMyEpisodeRatings,
  getMyMovieRatings,
  getMyLikes,
} from '@/api/trakt';

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
    path: '/movie',
    name: 'movie',
    component: () => import(/* webpackChunkName: "TV" */ '../views/movie.vue'),
  },
  {
    path: '/tv/:show/season/:season/episode/:episode',
    name: 'episode-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/episode-details.vue'),
  },
  {
    path: '/tv/:show/season/:season',
    name: 'season-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/season-details.vue'),
  },
  {
    path: '/tv/:show',
    name: 'show-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/show-details.vue'),
  },
  {
    path: '/movie/:movie',
    name: 'movie-details',
    component: () => import(/* webpackChunkName: "TV" */ '../views/movie-details.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "TV" */ '../views/search.vue'),
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
    authTokens = await getTokenFromRefresh(tokens.refreshToken, to.path);
    localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    store.updateTokens(authTokens);

    // get show ratings
    const myShowRatings = await getMyShowRatings(1);
    const storedEpRatings = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
    // set to localStorage here to eliminate delay
    localStorage.setItem('trakt-vue-show-ratings', JSON.stringify(myShowRatings));
    if (storedEpRatings?.lastModified !== myShowRatings.lastModified) {
      // only get the big rating object if new ratings have been added
      getMyShowRatings().then((remainingRatings) => {
        const total = { ...myShowRatings, ...remainingRatings };
        localStorage.setItem('trakt-vue-show-ratings', JSON.stringify(total));
      });
    }

    // get episode ratings
    const myEpRatings = await getMyEpisodeRatings(1);
    const storedShowRatings = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));
    // set to localStorage here to eliminate delay
    localStorage.setItem('trakt-vue-episode-ratings', JSON.stringify(myEpRatings));
    if (storedShowRatings?.lastModified !== myEpRatings.lastModified) {
      // getting the big rating object if ratings have changed
      getMyEpisodeRatings().then((remainingRatings) => {
        const total = { ...myEpRatings, ...remainingRatings };
        localStorage.setItem('trakt-vue-episode-ratings', JSON.stringify(total));
      });
    }

    // get movie ratings
    const myMovieRatings = await getMyMovieRatings(1);
    const storedMovieRatings = JSON.parse(localStorage.getItem('trakt-vue-movie-ratings'));
    // set to localStorage here to eliminate delay
    localStorage.setItem('trakt-vue-movie-ratings', JSON.stringify(myMovieRatings));
    if (storedMovieRatings?.lastModified !== myMovieRatings.lastModified) {
      // getting the big rating object if ratings have changed
      getMyMovieRatings().then((remainingRatings) => {
        const total = { ...myMovieRatings, ...remainingRatings };
        localStorage.setItem('trakt-vue-movie-ratings', JSON.stringify(total));
      });
    }

    // get likes
    const myLikes = await getMyLikes(1);
    const storedLikes = JSON.parse(localStorage.getItem('trakt-vue-likes'));
    // set to localStorage here to eliminate delay
    localStorage.setItem('trakt-vue-likes', JSON.stringify(myLikes));
    // need to add this check because this call needs token
    if (storedLikes && storedLikes[0] !== myLikes[0]) {
      if (storedLikes.length > 99) {
        getMyLikes().then((remainingLikes) => {
          const total = { ...myLikes, ...remainingLikes };
          localStorage.setItem('trakt-vue-likes', JSON.stringify(total));
        });
      } else {
        localStorage.setItem('trakt-vue-likes', JSON.stringify(myLikes));
      }
    }
  } else if (urlParams.get('code')) {
    // if no tokens were present and we fell into the else, we get redirected
    // with query: code and put tokens into local storage
    authTokens = await getToken(urlParams.get('code'));
    localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    store.updateTokens(authTokens);
    next({ name: to.name, query: null });
  } else {
    window.location = // eslint-disable-line
      'https://trakt.tv/oauth/authorize?response_type=code&client_id=8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3&redirect_uri=http://localhost:8080';
  }

  const myInfo = await getTraktSettings(authTokens.accessToken);
  store.updateMyInfo(myInfo);

  next();
});

export default router;
