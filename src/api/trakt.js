import axios from 'axios';

// -------- <AUTHENTICATION> -----------
export async function getToken(code) {
  const data = await axios({
    method: 'POST',
    url: 'https://api.trakt.tv/oauth/token',
    headers: { 'Content-Type': 'application/json' },
    data: {
      code,
      client_id: '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      client_secret: '93e1f2eb9e3c9e43cb06db7fd98feb630e8c90157579fa9af723d7181884ecb1',
      redirect_uri: 'http://localhost:8080',
      grant_type: 'authorization_code',
    },
  });
  return { accessToken: data.data.access_token, refreshToken: data.data.refresh_token };
}

export async function getTokenFromRefresh(refreshToken, path) {
  const data = await axios({
    method: 'POST',
    url: 'https://api.trakt.tv/oauth/token',
    headers: { 'Content-Type': 'application/json' },
    data: {
      refresh_token: refreshToken,
      client_id: '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      client_secret: '93e1f2eb9e3c9e43cb06db7fd98feb630e8c90157579fa9af723d7181884ecb1',
      redirect_uri: `http://localhost:8080${path}`,
      grant_type: 'refresh_token',
    },
  });
  return { accessToken: data.data.access_token, refreshToken: data.data.refresh_token };
}
// -------- </AUTHENTICATION> -----------

// -------- <SETTINGS> -----------
export async function getTraktSettings(token) {
  const response = await axios({
    method: 'GET',
    url: 'https://api.trakt.tv/users/settings',
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      Authorization: `Bearer ${token}`,
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  localStorage.setItem('trakt-vue-user', JSON.stringify(response.data.user));
  return response.data;
}
// -------- </SETTINGS> -----------

// -------- <GET> -----------
/**
 * @property {string} rType can be shows or movies
 */
export async function getRecommendationsFromMe(rType, page) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const limit = JSON.parse(localStorage.getItem('item-limit'));
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/users/${uName}/recommendations/${rType}/rank?limit=${limit}&page=${page}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return {
    items: response.data,
    page: parseInt(response.headers['x-pagination-page'], 10),
    pagesTotal: parseInt(response.headers['x-pagination-page-count'], 10),
  };
}

export async function getTrendingShows(page) {
  const limit = JSON.parse(localStorage.getItem('item-limit'));
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/trending?limit=${limit}&page=${page}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return {
    items: response.data,
    page: parseInt(response.headers['x-pagination-page'], 10),
    pagesTotal: parseInt(response.headers['x-pagination-page-count'], 10),
  };
}

/**
 * @param {string} mType - 'movies' or 'episodes'
 */
export async function getWatchedHistory(mType, page = 1) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const limit = JSON.parse(localStorage.getItem('item-limit'));
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/users/${uName}/history/${mType}?limit=${limit}&page=${page}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return {
    items: response.data,
    page: parseInt(response.headers['x-pagination-page'], 10),
    pagesTotal: parseInt(response.headers['x-pagination-page-count'], 10),
  };
}

export async function getTvCollection() {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  // no pagination available for this
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/users/${uName}/collection/shows`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getShowSummary(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/shows/${showId}?extended=full`,
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      },
    });
    // restructure to match Trending, My recommendations etc.
    const show = {
      ...response.data,
      ...{ show: { ids: response.data.ids, title: response.data.title, year: response.data.year } },
    };
    return show;
  } catch (error) {
    return null;
  }
}

export async function getMovieSummary(movieId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/movies/${movieId}?extended=full`,
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function getEpisodeSummary(showId, season, episode) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}?extended=full`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getEpisodeRating(showId, season, episode) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}/ratings`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data.rating.toFixed(1);
}

export async function getShowRating(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/ratings`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data.rating.toFixed(1);
}

export async function getMovieRating(movieId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/movies/${movieId}/ratings`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data.rating.toFixed(1);
}

export async function getShowActors(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/people`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getEpisodeActors(showId, season, episode) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}/people`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getMyEpisodeRatings(page) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const url = page
    ? `https://api.trakt.tv/users/${uName}/ratings/episodes?limit=100&page=${page}`
    : `https://api.trakt.tv/users/${uName}/ratings/episodes`;
  const response = await axios({
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  const ratings = {
    lastModified: response.headers['last-modified'],
    ratings: response.data,
  };
  return ratings;
}

export async function getMyShowRatings(page) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const url = page
    ? `https://api.trakt.tv/users/${uName}/ratings/shows?limit=100&page=${page}`
    : `https://api.trakt.tv/users/${uName}/ratings/shows`;
  const response = await axios({
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  const ratings = {
    lastModified: response.headers['last-modified'],
    ratings: response.data,
  };
  return ratings;
}

export async function getMyMovieRatings(page) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const url = page
    ? `https://api.trakt.tv/users/${uName}/ratings/movies?limit=100&page=${page}`
    : `https://api.trakt.tv/users/${uName}/ratings/movies`;
  const response = await axios({
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  const ratings = {
    lastModified: response.headers['last-modified'],
    ratings: response.data,
  };
  return ratings;
}

export async function getComments(showId, season = null, episode = null) {
  const mType = !season && !episode ? 'show' : 'episode';
  let url;
  if (mType === 'episode') {
    url = `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}/comments/newest`;
  } else {
    url = `https://api.trakt.tv/shows/${showId}/comments/newest`;
  }
  const response = await axios({
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return Promise.all(
    response.data.map(async (comment) => {
      try {
        const info = await axios({
          method: 'GET',
          url: `https://api.trakt.tv/users/${comment.user.ids.slug}?extended=full`,
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
          },
        });
        const defaultAvatar = // eslint-disable-line
          info.data.gender === 'female'
            ? 'https://i2.wp.com/walter.trakt.tv/hotlink-ok/placeholders/medium/leela.png'
            : 'https://i2.wp.com/walter.trakt.tv/hotlink-ok/placeholders/medium/fry.png';
        return {
          ...comment,
          ...{ avatar: info.data.images ? info.data.images?.avatar.full : defaultAvatar },
        };
      } catch {
        return {
          ...comment,
          ...{
            avatar: 'https://i2.wp.com/walter.trakt.tv/hotlink-ok/placeholders/medium/fry.png',
          },
        };
      }
    }),
  );
}

export async function getShowWatchedProgress(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/shows/${showId}/progress/watched?hidden=false&specials=false&count_specials=false`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getIdLookupTmdb(id, mType) {
  const mediaType = mType === 'movie' ? 'movie' : 'show';
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/search/tmdb/${id}?type=${mediaType}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data.length > 0 ? response.data[0][mediaType].ids : null;
}

export async function searchAutocomplete(keyword) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/search/movie,show?query=${keyword}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}
// -------- </GET> -----------

// -------- <POST> -----------
export async function rateShow(show, rating) {
  const response = await axios({
    method: 'POST',
    url: `https://api.trakt.tv/sync/ratings${rating === 0 ? '/remove' : ''}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
    data: {
      shows: [
        {
          rating,
          ids: show.ids ? show.ids : show.show.ids,
        },
      ],
    },
  });
  return response.status === 201;
}

export async function rateEpisode(episode, rating) {
  const response = await axios({
    method: 'POST',
    url: `https://api.trakt.tv/sync/ratings${rating === 0 ? '/remove' : ''}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
    data: {
      episodes: [
        {
          rating,
          ids: episode.ids,
        },
      ],
    },
  });
  return response.status === 201 || response.status === 200;
}
// -------- </POST> -----------
