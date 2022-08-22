import getImdbRating from '@/api/omdb';
import {
  getEpisodeBackdrop,
  getShowBackdrop,
  getMovieBackdrop,
  tmdbEpisodeDetails,
  tmdbShowDetails,
  tmdbMovieDetails,
  getSeasonPoster,
  getShowPoster,
  getMoviePoster,
  tmdbEpisodeActors,
  tmdbActors,
} from '@/api/tmdb';
import { getShowClearLogo, getMovieClearLogo } from '@/api/fanart';
import {
  getEpisodeSummary,
  getShowSummary,
  getMovieSummary,
  getEpisodeRating,
  getShowRating,
  getMovieRating,
  getIdLookupTrakt,
  getComments,
  getShowWatchedProgress,
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
  ]).then((results) => {
    [
      res.backdrop,
      res.season_poster,
      res.clear_logo,
      res.imdb_rating,
      res.trakt_rating,
      res.reviews,
      res.actors,
    ] = results;
    res.tmdb_rating = results[7]?.vote_average.toFixed(1);
  });

  // get my rating from ratings in local storage
  const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-episode-ratings'));
  res.my_rating = ratings.find((rating) => rating.episode.ids.trakt === summary.ids.trakt)?.rating;

  return { ...{ show }, ...summary, ...res };
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

  // get my rating from ratings in local storage
  const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
  res.my_rating = ratings.find((rating) => rating.show.ids.trakt === summary.ids.trakt)?.rating;

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
  });

  // get my rating from ratings in local storage
  const { ratings } = JSON.parse(localStorage.getItem('trakt-vue-show-ratings'));
  res.my_rating = ratings.find((rating) => rating.show.ids.trakt === summary.ids.trakt)?.rating;

  return { ...summary, ...res };
}
