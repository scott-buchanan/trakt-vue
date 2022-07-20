import axios from 'axios';

const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;

const functions = {
  getToken: async (code, path) => {
    const data = await axios({
      method: 'POST',
      url: 'https://api.trakt.tv/oauth/token',
      headers: { 'Content-Type': 'application/json' },
      data: {
        code,
        client_id: '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
        client_secret: '93e1f2eb9e3c9e43cb06db7fd98feb630e8c90157579fa9af723d7181884ecb1',
        redirect_uri: `http://localhost:8080${path}`,
        grant_type: 'authorization_code',
      },
    });
    return { accessToken: data.data.access_token, refreshToken: data.data.refresh_token };
  },
  getTokenFromRefresh: async (refreshToken, path) => {
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
  },
  getTvCollection: async () => {
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
  },
  getEpisodeRating: async (showId, season, episode) => {
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
  },
  getShowRating: async (showId) => {
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
  },
  getHistoryEpisodes: async (page = 1) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/users/${uName}/history/episodes?limit=21&page=${page}`,
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
  },
  getEpisodeInfo: async (showId, season, episode) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}?extended=full`,
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      },
    });
    console.error(response);
    return response.data;
  },
  getEpisodeActors: async (showId, season, episode) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}/people`,
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
      },
    });
    console.error(response);
    return response.data;
  },
  /**
   * @property {string} rType can be shows or movies
   */
  getRecommendationsFromMe: async (rType, page) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/users/${uName}/recommendations/${rType}/rank&page=${page}`,
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
  },
  getMyEpisodeRatings: async (page) => {
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
  },
  getMyShowRatings: async (page) => {
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
  },
  getTraktSettings: async (token) => {
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
    return response.data;
  },
  rateEpisode: async (episode, rating) => {
    const response = await axios({
      method: 'POST',
      url: 'https://api.trakt.tv/sync/ratings',
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
    return response.status === 201;
  },
  getEpisodeComments: async (showId, season, episode) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/shows/${showId}/seasons/${season}/episodes/${episode}/comments/newest`,
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
  },
};

export default functions;
