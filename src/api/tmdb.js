import axios from 'axios';
import * as fallback from '@/assets/fallback-tv.jpg';
import { getTvBackground, getMovieBackground } from './fanart';
import { getShowSummary, getMovieSummary, getIdLookupTmdb, getIdLookupActorTmdb } from './trakt';

export async function getAppBackgroundImg() {
  const response = await axios({
    method: 'GET',
    url: 'https://api.themoviedb.org/3/trending/all/day?api_key=89c6bd3331244e97eed61741fc798ab5',
  });
  const rando = Math.floor(Math.random() * response.data.results.length);
  return `https://image.tmdb.org/t/p/original${response.data.results[rando].backdrop_path}`;
}

export async function getShowPoster(show) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/images?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
  });

  if (response.data.posters.length > 0) {
    return `https://image.tmdb.org/t/p/w780/${response.data.posters[0].file_path}`;
  }
  // Sometimes the details call has a poster where the images call does not. Weird.
  const details = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return details.data.poster_path
    ? `https://image.tmdb.org/t/p/w780/${details.data.poster_path}`
    : fallback.default;
}

export async function getSeasonPoster(show, seasonNumber) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${seasonNumber}/images?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return `https://image.tmdb.org/t/p/w780/${response.data.posters[0].file_path}`;
  } catch {
    return getShowPoster(show);
  }
}

export async function getMoviePoster(movie) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${movie.ids.tmdb}/images?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
  });

  if (response.data.posters.length > 0) {
    return `https://image.tmdb.org/t/p/w780/${response.data.posters[0].file_path}`;
  }
  // Sometimes the details call has a poster where the images call does not. Weird.
  const details = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${movie.ids.tmdb}?language=en&api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return details.data.poster_path
    ? `https://image.tmdb.org/t/p/w780/${details.data.poster_path}`
    : fallback.default;
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - Show object.
 * @returns {String} image url.
 */
export async function getShowBackdrop(show) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/images?api_key=89c6bd3331244e97eed61741fc798ab5&include_image_language=null`,
    });
    if (response.data.backdrops.length < 1) {
      const fanartBackground = await getTvBackground(show.ids.tvdb);
      if (!fanartBackground) throw new Error('no images found');
      return {
        backdrop_sm: fanartBackground,
        backdrop_lg: fanartBackground,
      };
    }
    response.data.backdrops.sort((a, b) => b.vote_average - a.vote_average || b.height - a.height);
    return {
      backdrop_sm: `https://image.tmdb.org/t/p/w780${response.data.backdrops[0].file_path}`,
      backdrop_lg: `https://image.tmdb.org/t/p/w1280${response.data.backdrops[0].file_path}`,
    };
  } catch {
    return { backdrop_sm: fallback.default, backdrop_lg: fallback.default };
  }
}

export async function getEpisodeBackdrop(show, episode) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${episode.season}/episode/${episode.number}/images?api_key=89c6bd3331244e97eed61741fc798ab5&include_image_language=null`,
    });
    if (response.data.stills.length < 1) {
      return await getShowBackdrop(show);
    }
    return {
      backdrop_sm: `https://image.tmdb.org/t/p/w780${response.data.stills[0].file_path}`,
      backdrop_lg: `https://image.tmdb.org/t/p/w1280${response.data.stills[0].file_path}`,
    };
  } catch {
    return getShowBackdrop(show);
  }
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - Show object.
 * @returns {String} image url.
 */
export async function getMovieBackdrop(movie) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/${movie.ids.tmdb}/images?api_key=89c6bd3331244e97eed61741fc798ab5&include_image_language=null`,
    });
    if (response.data.backdrops.length < 1) {
      const fanartBackground = await getMovieBackground(movie.ids.tvdb);
      return {
        backdrop_sm: fanartBackground,
        backdrop_lg: fanartBackground,
      };
    }
    return {
      backdrop_sm: `https://image.tmdb.org/t/p/w780${response.data.backdrops[0].file_path}`,
      backdrop_lg: `https://image.tmdb.org/t/p/w1280${response.data.backdrops[0].file_path}`,
    };
  } catch {
    return { sm: fallback.default, lg: fallback.default };
  }
}

export async function tmdbEpisodeDetails(show, episode) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${episode.season}/episode/${episode.number}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function tmdbShowDetails(show) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    const { data } = response;
    const seasons = [];
    await Promise.all(
      data.seasons.map(async (season) => {
        if (season.episode_count > 0) {
          let path;
          if (!season.poster_path) {
            path = await getShowPoster(show);
          } else {
            path = `https://image.tmdb.org/t/p/w200${season.poster_path}`;
          }
          seasons.push({ ...season, ...{ poster_path: path } });
        }
      })
    );
    data.seasons = seasons;
    data.seasons.sort((a, b) => a.season_number - b.season_number);

    if (data.seasons[0].name.toLowerCase() === 'specials') {
      const specials = data.seasons.shift();
      data.seasons.push(specials);
    }

    return data;
  } catch {
    return null;
  }
}

export async function tmdbShowSeasonDetails(show, season) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${season}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });

    const episodes = [];
    await Promise.all(
      response.data.episodes.map(async (episode) => {
        const ep = { season: episode.season_number, number: episode.episode_number };
        const backdrop = await getEpisodeBackdrop(show, ep);
        episodes.push({ ...episode, ...{ backdrop } });
      })
    );

    episodes.sort((a, b) => a.episode_number - b.episode_number);

    return { ...response.data, ...{ episodes } };
  } catch {
    return null;
  }
}

export async function tmdbMovieDetails(movie) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/${movie.ids.tmdb}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function tmdbEpisodeActors(show, episode) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${episode.season}/episode/${episode.number}/credits?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    const data = response.data.cast;
    const actors = [];
    await Promise.all(
      data.map(async (item) => {
        const actorIds = await getIdLookupActorTmdb(item.id);
        const path = `https://image.tmdb.org/t/p/w200${item.profile_path}`;
        actors.push({ ...item, ...{ profile_path: path }, ids: actorIds.person.ids });
      })
    );
    return actors.sort((a, b) => a.order - b.order);
  } catch (error) {
    return null;
  }
}

export async function tmdbActors(item) {
  try {
    const mType = item.type === 'movie' ? 'movie' : 'tv';
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/${mType}/${item.ids.tmdb}/credits?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    const data = response.data.cast;
    const actors = [];
    await Promise.all(
      data.map(async (actor) => {
        const actorIds = await getIdLookupActorTmdb(actor.id);
        const path = `https://image.tmdb.org/t/p/w200${actor.profile_path}`;
        actors.push({
          ...actor,
          ...{ profile_path: actor.profile_path ? path : null },
          ids: actorIds.person.ids,
        });
      })
    );
    return actors.sort((a, b) => a.order - b.order);
  } catch (error) {
    return null;
  }
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
      keyword
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
    })
  );
  return returnVal.sort((a, b) => b.popularity - a.popularity);
}

export async function getMovieCollection(collectionId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/collection/${collectionId}?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return response.data;
}
