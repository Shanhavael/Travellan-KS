import axios from 'axios';
import { MAPBOX_API_KEY } from 'react-native-dotenv';

const API_KEY = MAPBOX_API_KEY;

async function fetchMapRoute(points) {
  return await axios
    .get(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/walking/${points}?&geometries=geojson&access_token=${API_KEY}`,
    )
    .then((json) => json.data.trips);
}

export default fetchMapRoute;
