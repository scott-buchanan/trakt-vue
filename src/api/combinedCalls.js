import getImdbRating from '@/api/omdb';
import {
  getEpisodeBackdrop,
  getShowBackdrop,
  getMovieBackdrop,
  tmdbEpisodeDetails,
  tmdbShowDetails,
  tmdbShowSeasonDetails,
  tmdbMovieDetails,
  getSeasonPoster,
  getShowPoster,
  getMoviePoster,
  tmdbEpisodeActors,
  tmdbActors,
  getMovieCollection as tmdbMovieCollection,
} from '@/api/tmdb';
import { getShowClearLogo, getMovieClearLogo } from '@/api/fanart';
import {
  getEpisodeSummary,
  getShowSummary,
  getMovieSummary,
  getEpisodeRating,
  getShowRating,
  getMovieRating,
  getIdLookupTmdb,
  getIdLookupTrakt,
  getComments,
  getShowWatchedProgress,
  getSeasonSummary,
} from '@/api/trakt';

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @param {Object} episode - trakt episode object
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getEpisodeInfoCard(show, episode) {
  const res = {};
  await Promise.all([
    getEpisodeBackdrop(show, episode),
    getShowClearLogo(show.ids.tvdb),
    getImdbRating(episode.ids.imdb),
    getEpisodeRating(show.ids.trakt, episode.season, episode.number),
    tmdbEpisodeDetails(show, episode),
  ]).then((results) => {
    [res.backdrop, res.clear_logo, res.imdb_rating, res.trakt_rating] = results;
    res.tmdb_rating = results[4]?.vote_average.toFixed(1);
    res.type = 'episode';
  });
  return res;
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getShowInfoCard(show) {
  const res = {};
  await Promise.all([
    getShowBackdrop(show),
    getShowClearLogo(show.ids.tvdb),
    getImdbRating(show.ids.imdb),
    getShowRating(show.ids.trakt),
    tmdbShowDetails(show),
  ]).then((results) => {
    [res.backdrop, res.clear_logo, res.imdb_rating, res.trakt_rating] = results;
    res.tmdb_rating = results[4]?.vote_average.toFixed(1);
    res.genres = results[4]?.genres;
    res.type = 'show';
  });
  return res;
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getMovieInfoCard(movie) {
  const res = {};
  await Promise.all([
    getMovieBackdrop(movie),
    getMovieClearLogo(movie.ids.tmdb),
    getImdbRating(movie.ids.imdb),
    getMovieRating(movie.ids.trakt),
    tmdbMovieDetails(movie),
  ]).then((results) => {
    [res.backdrop, res.clear_logo, res.imdb_rating, res.trakt_rating] = results;
    res.tmdb_rating = results[4]?.vote_average.toFixed(1);
    res.genres = results[4]?.genres;
    res.type = 'movie';
  });
  return res;
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getEpisodeDetails(slug, season, episode) {
  const res = {};
  const summary = await getEpisodeSummary(slug, season, episode);
  const { show } = await getIdLookupTrakt(summary.ids.trakt);

  summary.type = 'episode';
  summary.slug = show.ids.slug;

  await Promise.all([
    getEpisodeBackdrop(show, summary),
    getSeasonPoster(show, summary.season),
    getShowClearLogo(show.ids.tvdb),
    getImdbRating(summary.ids.imdb),
    getEpisodeRating(show.ids.trakt, summary.season, summary.number),
    getComments(summary),
    tmdbEpisodeActors(show, summary),
    tmdbEpisodeDetails(show, summary),
    getShowWatchedProgress(show.ids.trakt),
  ]).then((results) => {
    [
      res.backdrop,
      res.season_poster,
      res.clear_logo,
      res.imdb_rating,
      res.trakt_rating,
      res.reviews,
      res.actors,
      res.tmdb_data,
    ] = results;
    res.tmdb_rating = results[7]?.vote_average.toFixed(1);

    const watchedProgress = results[8];
    let watched;
    // add to episode watched array
    if (watchedProgress?.completed > 0) {
      watched = localStorage.getItem('trakt-vue-watched-episodes')
        ? JSON.parse(localStorage.getItem('trakt-vue-watched-episodes'))
        : [];
      if (watched[show.ids.slug]) {
        watched[show.ids.slug] = watchedProgress;
      } else {
        watched.push({ [show.ids.slug]: watchedProgress });
      }
      localStorage.setItem('trakt-vue-watched-episodes', JSON.stringify(watched));
    }

    const haveWatched = watched?.find((item) => Object.keys(item)[0] === show.ids.slug);
    if (haveWatched) {
      res.watched_progress = {
        last_watched_at:
          Object.values(haveWatched)[0].seasons[season - 1].episodes[episode - 1].last_watched_at,
        type: 'episode',
      };
    }
  });

  if (localStorage.getItem('trakt-vue-user')) {
    // get my rating from ratings in local storage
    const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));
    res.my_rating = ratings.find(
      (rating) => rating.episode.ids.trakt === summary.ids.trakt
    )?.rating;
  }

  return { ...{ show }, ...summary, ...res };
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getSeasonDetails(slug, season) {
  const res = {};

  const showInfo = await getShowSummary(slug);
  const summary = { show: { ids: showInfo.ids } };
  summary.type = 'season';
  summary.title = showInfo.title;
  summary.show.season = season;
  summary.show.type = 'season';

  const seasonInfo = await getSeasonSummary(slug, parseInt(season, 10));
  seasonInfo.trakt_rating = seasonInfo.rating.toFixed(1);

  [res.backdrop, res.clear_logo, res.tmdb_data, res.reviews] = await Promise.all([
    getShowBackdrop(summary.show),
    getShowClearLogo(summary.show.ids.tvdb),
    tmdbShowSeasonDetails(summary.show, season),
    getComments(summary.show),
  ]);
  if (!res.tmdb_data.poster_path) {
    res.poster = await getShowPoster(summary.show);
  } else {
    res.poster = `https://image.tmdb.org/t/p/w780${res.tmdb_data.poster_path}`;
  }

  if (localStorage.getItem('trakt-vue-user')) {
    // get my rating from ratings in local storage
    const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-season-ratings'));
    res.my_rating = ratings.find(
      (rating) => rating.season.ids.trakt === seasonInfo.ids.trakt
    )?.rating;
  }

  return { ...res, ...seasonInfo, ...summary };
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getShowDetails(slug) {
  const res = {};
  const summary = await getShowSummary(slug);

  summary.type = 'show';

  await Promise.all([
    getShowBackdrop(summary),
    getShowPoster(summary),
    getShowClearLogo(summary.ids.tvdb),
    getImdbRating(summary.ids.imdb),
    getShowRating(summary.ids.trakt),
    tmdbShowDetails(summary),
    getComments(summary),
    tmdbActors(summary),
    getShowWatchedProgress(summary.ids.trakt),
  ]).then((results) => {
    [
      res.backdrop,
      res.show_poster,
      res.clear_logo,
      res.imdb_rating,
      res.trakt_rating,
      res.tmdb_data,
      res.reviews,
      res.actors,
      res.watched_progress,
    ] = results;
    res.tmdb_rating = results[5]?.vote_average.toFixed(1);
  });

  if (localStorage.getItem('trakt-vue-user')) {
    // get my rating from ratings in local storage
    const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
    res.my_rating = ratings.find((rating) => rating.show.ids.trakt === summary.ids.trakt)?.rating;
  }

  return { ...summary, ...res };
}

/**
 * Gets the info needed to display episode info in the CardContainer component.
 * @function
 * @param {Object} show - trakt show object.
 * @returns {Object} Object containing images, ratings needed.
 */
export async function getMovieDetails(slug) {
  const res = {};
  const summary = await getMovieSummary(slug);
  const watched = JSON.parse(localStorage.getItem('trakt-vue-watched-movies'));

  summary.type = 'movie';

  await Promise.all([
    getMovieBackdrop(summary),
    getMoviePoster(summary),
    getMovieClearLogo(summary.ids.tmdb),
    getImdbRating(summary.ids.imdb),
    getMovieRating(summary.ids.trakt),
    tmdbMovieDetails(summary),
    getComments(summary),
    tmdbActors(summary),
  ]).then((results) => {
    [
      res.backdrop,
      res.poster,
      res.clear_logo,
      res.imdb_rating,
      res.trakt_rating,
      res.tmdb_data,
      res.reviews,
      res.actors,
    ] = results;
    res.tmdb_rating = results[5]?.vote_average.toFixed(1);
    const haveWatched = watched?.find((item) => item.movie.ids.trakt === summary.ids.trakt);
    res.watched_progress = haveWatched
      ? {
          ...haveWatched,
          ...{ type: 'movie' },
        }
      : null;
  });

  // get my rating from ratings in local storage
  if (localStorage.getItem('trakt-vue-user')) {
    const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-movie-ratings'));
    res.my_rating = ratings.find((rating) => rating.movie.ids.trakt === summary.ids.trakt)?.rating;
  }

  return { ...summary, ...res };
}

export async function getMovieCollection(collectionId) {
  const collection = await tmdbMovieCollection(collectionId);
  const watched = JSON.parse(localStorage.getItem('trakt-vue-watched-movies'));
  const parts = [];

  await Promise.all(
    collection.parts.map(async (item) => {
      const ids = await getIdLookupTmdb(item.id, 'movie');
      parts.push({
        ...item,
        ...{
          slug: ids.slug,
          poster_path: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
          watched_progress: watched?.find(
            (watchedItems) => watchedItems.movie.ids.tmdb === item.id
          ),
        },
      });
    })
  );

  collection.parts = parts.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

  return collection;
}
