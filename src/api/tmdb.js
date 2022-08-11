import axios from 'axios';
import * as fallback from '@/assets/fallback-tv.jpg';
import getImdbRating from '@/api/omdb';
import { getShowClearLogo, getMovieClearLogo, getTvThumb } from './fanart';
import {
  getEpisodeRating,
  getShowRating,
  getMovieRating,
  getShowSummary,
  getMovieSummary,
  getIdLookupTmdb,
} from './trakt';

export async function getAppBackgroundImg() {
  const response = await axios({
    method: 'GET',
    url: 'https://api.themoviedb.org/3/trending/tv/day?api_key=89c6bd3331244e97eed61741fc798ab5',
  });
  const rando = Math.floor(Math.random() * response.data.results.length);
  return `https://image.tmdb.org/t/p/original/${response.data.results[rando].backdrop_path}`;
}

export async function getShowPoster(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${showId}/images?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return response.data.posters.length > 0
    ? `https://image.tmdb.org/t/p/w500/${response.data.posters[0].file_path}`
    : fallback.default;
}

export async function getSeasonPoster(showId, seasonNumber) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}/images?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return `https://image.tmdb.org/t/p/w500/${response.data.posters[0].file_path}`;
  } catch {
    return getShowPoster(showId);
  }
}

export async function getShowBackdrop(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${showId}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return {
      sm: `https://image.tmdb.org/t/p/w780/${response.data.backdrops[0].file_path}`,
      lg: `https://image.tmdb.org/t/p/original/${response.data.backdrops[0].file_path}`,
    };
  } catch {
    return { sm: fallback.default, lg: fallback.default };
  }
}

export async function getEpisodeBackdrops(showId, season, episode) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${showId}/season/${season}/episode/${episode}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return response.data.stills;
  } catch {
    return fallback.default;
  }
}

export async function getEpisodeInfo(show, episode) {
  let returnVal;
  let season;
  if (episode.season > 1900) {
    season = episode.season - show.year + 1;
  } else {
    season = episode.season;
  }
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${season}/episode/${episode.number}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    returnVal = response.data;
    if (!returnVal.still_path) {
      const result = await getShowBackdrop(show.ids.tmdb);
      returnVal.backdrop_sm = result.sm;
      returnVal.backdrop_lg = result.lg;
    } else {
      returnVal.backdrop_sm = `https://image.tmdb.org/t/p/w780/${response.data.still_path}`;
      returnVal.backdrop_lg = `https://image.tmdb.org/t/p/original/${response.data.still_path}`;
    }
    [returnVal.clear_logo, returnVal.imdb_rating, returnVal.trakt_rating] = await Promise.all([
      getShowClearLogo(show.ids.tvdb),
      getImdbRating(episode.ids.imdb),
      getEpisodeRating(show.ids.trakt, episode.season, episode.number),
    ]);
    returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
    return returnVal;
  } catch {
    const result = await getShowBackdrop(show.ids.tmdb);
    return { backdrop_sm: result.sm, backdrop_lg: result.lg };
  }
}

/**
 * @param {string} mType - 'movie' or 'tv'
 */
export async function getInfo(mType, ids) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/${mType}/${ids.tmdb}?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  const returnVal = { ...response.data };
  const ratingFunction = mType === 'movie' ? getMovieRating : getShowRating;
  const clearLogoFunction = mType === 'movie' ? getMovieClearLogo : getShowClearLogo;
  [returnVal.clear_logo, returnVal.imdb_rating, returnVal.trakt_rating] = await Promise.all([
    clearLogoFunction(mType === 'movie' ? ids.tmdb : ids.tvdb),
    getImdbRating(ids.imdb),
    ratingFunction(ids.trakt),
  ]);
  let backdrop = response.data.backdrop_path;
  if (backdrop === null) {
    backdrop = await getTvThumb(ids.tvdb);
    returnVal.backdrop_sm = backdrop;
    returnVal.backdrop_lg = backdrop;
  } else {
    returnVal.backdrop_sm = `https://image.tmdb.org/t/p/w780/${backdrop}`;
    returnVal.backdrop_lg = `https://image.tmdb.org/t/p/original/${backdrop}`;
  }
  returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
  return returnVal;
}

export async function getActorImage(tmdbId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/person/${tmdbId}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return response.data;
}

export async function rateEpisode(showId, season, episode, rating) {
  const response = await axios({
    method: 'POST',
    url: `https://api.themoviedb.org/3/tv/${showId}/season/${season}/episode/${episode}/rating?api_key=89c6bd3331244e97eed61741fc798ab5`,
    data: {
      value: rating,
    },
  });
  return response.status === 201;
}

export async function getShowVideos(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${showId}/videos?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return response.data.results;
}

export async function getSearchResults(keyword, page = 1) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/search/multi?api_key=89c6bd3331244e97eed61741fc798ab5&query=${encodeURIComponent(
      keyword,
    )}&page=${page}`,
  });
  const noPeople = response.data.results.filter((item) => item.media_type !== 'person');
  const returnVal = [];
  await Promise.all(
    noPeople.map(async (item) => {
      let result;
      const ids = await getIdLookupTmdb(item.id, item.media_type === 'movie' ? 'movie' : 'show');
      if (ids) {
        if (item.media_type === 'movie') {
          result = await getMovieSummary(ids.trakt);
          if (result) returnVal.push({ ...{ ids }, ...item, ...{ genres: result.genres } });
        } else {
          result = await getShowSummary(ids.trakt);
          if (result) returnVal.push({ ...{ ids }, ...item, ...{ genres: result.genres } });
        }
      }
    }),
  );
  return returnVal.sort((a, b) => b.popularity - a.popularity);
}
