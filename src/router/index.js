import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from '@/store/index';
import {
  getTokenFromRefresh,
  getToken,
  getTraktSettings,
  getMyShowRatings,
  getMySeasonRatings,
  getMyEpisodeRatings,
  getMyMovieRatings,
  getMyLikes,
  getMyWatchedMovies,
} from '@/api/trakt';

const routes = [
  {
    path: '/',
    redirect: `/tv/trending`,
  },
  {
    path: '/tv',
    name: 'tv',
    redirect: `/tv/trending`,
    component: () => import(/* webpackChunkName: "tv" */ '../views/tv.vue'),
  },
  {
    path: '/tv/:show',
    name: 'show-details',
    component: () => import(/* webpackChunkName: "show-details" */ '../views/show-details.vue'),
  },
  {
    path: '/tv/:filter',
    name: 'show-list',
    component: () => import(/* webpackChunkName: "show-list" */ '../views/tv.vue'),
  },
  {
    path: '/tv/:show/season/:season/episode/:episode',
    name: 'episode-details',
    component: () =>
      import(/* webpackChunkName: "episode-details" */ '../views/episode-details.vue'),
  },
  {
    path: '/tv/:show/season/:season',
    name: 'season-details',
    component: () => import(/* webpackChunkName: "season-details" */ '../views/season-details.vue'),
  },
  {
    path: '/movie',
    name: 'movie',
    redirect: '/movie/trending',
    component: () => import(/* webpackChunkName: "movie" */ '../views/movie.vue'),
  },
  {
    path: '/movie/:movie',
    name: 'movie-details',
    component: () => import(/* webpackChunkName: "movie-details" */ '../views/movie-details.vue'),
  },
  {
    path: '/movie/:filter',
    name: 'movie-list',
    component: () => import(/* webpackChunkName: "movie-list" */ '../views/movie.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '../views/search.vue'),
  },
  {
    // 404
    path: '/:pathMatch(.*)*',
    redirect: '/tv',
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useStore();
  const urlParams = new URLSearchParams(window.location.search);

  // redirect if needed
  const filterType = to.path.includes('/tv/') ? 'show' : 'movie';
  const urlLastPart = to.path.split('/')[to.path.split('/').length - 1];
  const isFilter =
    store.filterOptions[filterType].find((filter) => filter.value === urlLastPart) !== undefined;
  if ((to.name === 'show-details' || to.name === 'movie-details') && isFilter) {
    next({ name: `${filterType}-list`, params: { filter: urlLastPart } });
    return;
  }
  // ------------------

  const checkToken = async () => {
    if (localStorage.getItem('trakt-vue-token')) {
      // if local storage has tokens, get the accessToken from the refreshToken
      const tokens = JSON.parse(localStorage.getItem('trakt-vue-token'));
      const storedLikes = JSON.parse(localStorage.getItem('trakt-vue-likes'));
      let myInfo = JSON.parse(localStorage.getItem('trakt-vue-user'));
      let myShowRatings = [];
      let mySeasonRatings = [];
      let myEpRatings = [];
      let myMovieRatings = [];
      let myLikes = [];
      let myWatchedMovies = [];

      const getRatings = (item, initialCallRatings, ratingFunction) => {
        // get show ratings
        const storedRatings = JSON.parse(localStorage.getItem(`trakt-vue-${item}-ratings`));
        if (!storedRatings) {
          // set to localStorage here to eliminate delay
          localStorage.setItem(`trakt-vue-${item}-ratings`, JSON.stringify(initialCallRatings));
        }
        if (
          initialCallRatings.total > initialCallRatings.length ||
          storedRatings?.lastModified !== initialCallRatings.lastModified
        ) {
          // only get the big rating object if new ratings have been added
          ratingFunction().then((remainingRatings) => {
            localStorage.setItem(`trakt-vue-${item}-ratings`, JSON.stringify(remainingRatings));
          });
        }
      };

      if (tokens.expires_in < 86400) {
        const authTokens = await getTokenFromRefresh(tokens.refresh_token, to.path);
        localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
        store.updateTokens(authTokens);
      }

      if (!myInfo) {
        myInfo = await getTraktSettings(tokens.access_token);
      }
      store.updateMyInfo(myInfo);

      if (to.path.split('/')[1] === 'movie') {
        [myMovieRatings, myLikes, myWatchedMovies] = await Promise.all([
          getMyMovieRatings(1),
          getMyLikes(1),
          getMyWatchedMovies(),
        ]);
        getRatings('movie', myMovieRatings, getMyMovieRatings);
        // set watched movies
        localStorage.setItem('trakt-vue-watched-movies', JSON.stringify(myWatchedMovies));
      } else {
        [myShowRatings, mySeasonRatings, myEpRatings, myLikes] = await Promise.all([
          getMyShowRatings(1),
          getMySeasonRatings(1),
          getMyEpisodeRatings(1),
          getMyLikes(1),
        ]);
        getRatings('show', myShowRatings, getMyShowRatings);
        getRatings('season', mySeasonRatings, getMySeasonRatings);
        getRatings('episode', myEpRatings, getMyEpisodeRatings);
      }

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
    }
    // next();
  };

  checkToken();

  if (urlParams.get('code')) {
    // if no tokens were present and we fell into the else, we get redirected
    // with query: code and put tokens into local storage
    const authTokens = await getToken(urlParams.get('code'));
    localStorage.setItem('trakt-vue-token', JSON.stringify(authTokens));
    store.updateTokens(authTokens);
    checkToken();
  }

  next();
});

export default router;
