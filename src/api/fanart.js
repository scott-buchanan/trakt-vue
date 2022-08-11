import axios from 'axios';

export async function getShowClearLogo(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://webservice.fanart.tv/v3/tv/${showId}?api_key=6c7b80e914b8b4a7f630895236272ee0`,
    });
    return response.data.hdtvlogo[0].url;
  } catch (error) {
    return null;
  }
}

export async function getMovieClearLogo(movieId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://webservice.fanart.tv/v3/movies/${movieId}?api_key=6c7b80e914b8b4a7f630895236272ee0`,
    });
    return response.data.hdmovielogo[0].url;
  } catch (error) {
    return null;
  }
}

export async function getBanner(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://webservice.fanart.tv/v3/tv/${showId}?api_key=6c7b80e914b8b4a7f630895236272ee0`,
    });
    return response.data.tvbanner[0].url;
  } catch (error) {
    return null;
  }
}

export async function getTvThumb(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://webservice.fanart.tv/v3/tv/${showId}?api_key=6c7b80e914b8b4a7f630895236272ee0`,
    });
    return response.data.tvthumb[0].url;
  } catch (error) {
    return null;
  }
}
