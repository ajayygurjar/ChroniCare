import axios from 'axios';
import { FIREBASE_DB_URL } from '../src/firebase/firebaseConfig';

const axiosInstance = axios.create({
  baseURL: `${FIREBASE_DB_URL}`,
});
export default axiosInstance;