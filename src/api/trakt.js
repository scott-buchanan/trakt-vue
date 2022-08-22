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

export async function getTrending(mType, page) {
  const limit = JSON.parse(localStorage.getItem('item-limit'));
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/${mType}/trending?limit=${limit}&page=${page}`,
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
  try {
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
  } catch {
    return null;
  }
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

// export async function getEpisodeActorsTrakt(show, episode) {
//   const response = await axios({
//     method: 'GET',
//     url: `https://api.trakt.tv/shows/${show.ids.trakt}/seasons/${episode.season}/episodes/${episode.number}/people`,
//     headers: {
//       'Content-Type': 'application/json',
//       'trakt-api-version': '2',
//       'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
//     },
//   });
//   return response.data;
// }

export async function getMyEpisodeRatings(page = null) {
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

export async function getMyShowRatings(page = null) {
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

export async function getMyMovieRatings(page = null) {
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

export async function getMyLikes(page = null) {
  const uName = JSON.parse(localStorage.getItem('trakt-vue-user'))?.username;
  const url = `https://api.trakt.tv/users/${uName}/likes/type?limit=100&page=${page}`;
  const response = await axios({
    method: 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data;
}

export async function getComments(item, reply = false) {
  let url;
  if (reply) {
    url = `https://api.trakt.tv/comments/${item}/replies`;
  } else if (item.type === 'episode') {
    url = `https://api.trakt.tv/shows/${item.slug}/seasons/${item.season}/episodes/${item.number}/comments/likes`;
  } else if (item.type === 'show') {
    url = `https://api.trakt.tv/shows/${item.ids.trakt}/comments/likes`;
  } else {
    url = `https://api.trakt.tv/movies/${item.ids.trakt}/comments/likes`;
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
    })
  );
}

// export async function getCommentReplies(commentId) {
//   const response = await axios({
//     method: 'GET',
//     url: `https://api.trakt.tv/comments/${commentId}/replies`,
//     headers: {
//       'Content-Type': 'application/json',
//       'trakt-api-version': '2',
//       'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
//     },
//   });
//   return response.data;
// }

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
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/search/tmdb/${id}?type=${mType}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data.length > 0 ? response.data[0][mType].ids : null;
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {String} id - trakt id or slug.
 * @param {String} mType - media type: can be movie, show, episode, person
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getIdLookupTrakt(id, mType = null) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/search/trakt/${id}${mType ? `?type=${mType}` : null}`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data[0];
}

export async function getIdLookupActorTmdb(id) {
  const response = await axios({
    method: 'GET',
    url: `https://api.trakt.tv/search/tmdb/${id}?type=person`,
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.data[0];
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
          ids: show.show.ids,
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

export async function rateMovie(movie, rating) {
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
      movies: [
        {
          rating,
          ids: movie.ids,
        },
      ],
    },
  });
  return response.status === 201;
}

export async function likeComment(id, deleteComment = false) {
  const response = await axios({
    method: deleteComment ? 'DELETE' : 'POST',
    url: `https://api.trakt.tv/comments/${id}/like`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('trakt-vue-token')).accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
    },
  });
  return response.status === 204;
}
// -------- </POST> -----------
