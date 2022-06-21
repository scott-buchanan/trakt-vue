import axios from 'axios';

export default async function getClearLogo(showId) {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://webservice.fanart.tv/v3/tv/${showId}?api_key=6c7b80e914b8b4a7f630895236272ee0`,
    });
    return response.data.hdtvlogo[0].url;
  } catch (error) {
    console.log(error);
    return null;
  }
}
