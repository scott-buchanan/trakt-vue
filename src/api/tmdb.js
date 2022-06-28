import axios from 'axios';
import fallback from '@/assets/fallback-tv.jpg';
import getClearLogo from './fanart';
import trakt from './trakt';

export async function getSeasonImage(showId, seasonNumber) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return `https://image.tmdb.org/t/p/original/${response.data.posters[0].file_path}`;
}

export async function getShowImage(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${showId}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    return `https://image.tmdb.org/t/p/original/${response.data.backdrops[0].file_path}`;
  } catch (error) {
    console.log(error);
    return fallback; // eslint-disable-line
  }
}

async function getImdbRating(id) {
  try {
    const response = await axios({
      method: 'GET',
      url: `http://www.omdbapi.com/?apikey=8b1738a&i=${id}`,
    });
    return response.data.Ratings[0].Value.split('/')[0];
  } catch (error) {
    return null;
  }
}

export async function getTMDBEpisodeInfo(show, episode) {
  const returnVal = {};
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${show.ids.tmdb}/season/${episode.season}/episode/${episode.number}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    returnVal.clear_logo = await getClearLogo(show.ids.tvdb);
    returnVal.imdb_rating = await getImdbRating(episode.ids.imdb);
    returnVal.trakt_rating = await trakt.getEpisodeRating(
      show.ids.trakt,
      episode.season,
      episode.number,
    );
    if (!response.data.still_path) {
      returnVal.backdrop = await getShowImage(show.ids.tmdb);
    } else {
      returnVal.backdrop = `https://image.tmdb.org/t/p/original/${response.data.still_path}`;
    }
    returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
    return returnVal;
  } catch (error) {
    console.log(error);
    returnVal.clear_logo = await getClearLogo(show.ids.tvdb);
    returnVal.backdrop = await getShowImage(show.ids.tmdb);
    returnVal.imdb_rating = await getImdbRating(episode.ids.imdb);
    return returnVal;
  }
}

export async function getShowInfo(ids) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${ids.tmdb}?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  const returnVal = { ...response.data };
  returnVal.clear_logo = getClearLogo(ids.tvdb);
  // console.log(response.data);
  returnVal.image = `https://image.tmdb.org/t/p/original/${
    response.data.backdrop_path ? response.data.backdrop_path : response.data.poster_path
  }`;
  getImdbRating(ids.imdb).then((rating) => {
    returnVal.imdb_rating = rating;
  });
  returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
  return returnVal;
}
