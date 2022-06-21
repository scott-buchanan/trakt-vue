import axios from 'axios';

const functions = {
  getToken: async (code) => {
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
  },
  getCollection: async () => {
    // no pagination available for this
    const response = await axios({
      method: 'GET',
      url: 'https://api.trakt.tv/users/bukes/collection/shows',
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
      url: `https://api.trakt.tv/users/bukes/history/episodes?limit=20&page=${page}`,
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
  /**
   * @property {string} rType can be shows or movies
   */
  getRecommendationsFromMe: async (rType, page) => {
    const response = await axios({
      method: 'GET',
      url: `https://api.trakt.tv/users/bukes/recommendations/${rType}/rank&page=${page}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('trakt-vue-token')}`,
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
};

export default functions;
