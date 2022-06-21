import axios from 'axios';
import getClearLogo from './fanart';

export async function getSeasonImage(showId, seasonNumber) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return `https://image.tmdb.org/t/p/original/${response.data.posters[0].file_path}`;
}

export async function getShowImage(showId) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${showId}/images?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  return `https://image.tmdb.org/t/p/original/${response.data.backdrops[0].file_path}`;
}

export async function getEpisodeInfo(ids, seasonNumber, episodeNumber) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.themoviedb.org/3/tv/${ids.tmdb}/season/${seasonNumber}/episode/${episodeNumber}?api_key=89c6bd3331244e97eed61741fc798ab5`,
    });
    const returnVal = {};
    returnVal.clear_logo = await getClearLogo(ids.tvdb);
    if (!response.data.still_path) {
      const showImage = await getShowImage(ids.tmdb);
      returnVal.image = showImage;
    } else {
      returnVal.image = `https://image.tmdb.org/t/p/original/${response.data.still_path}`;
    }
    returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
    return returnVal;
  } catch (error) {
    const showImage = await getShowImage(ids.tmdb);
    return { image: showImage };
  }
}

export async function getShowInfo(ids) {
  const response = await axios({
    method: 'GET',
    url: `https://api.themoviedb.org/3/tv/${ids.tmdb}?api_key=89c6bd3331244e97eed61741fc798ab5`,
  });
  console.log(response);
  const returnVal = { ...response.data };
  returnVal.clear_logo = await getClearLogo(ids.tvdb);
  // console.log(response.data);
  returnVal.image = `https://image.tmdb.org/t/p/original/${
    response.data.backdrop_path ? response.data.backdrop_path : response.data.poster_path
  }`;
  returnVal.tmdb_rating = response.data.vote_average.toFixed(1);
  return returnVal;
}
