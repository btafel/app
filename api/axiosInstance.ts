import axios from 'axios';
import getEnvVars from './environment';
import Constants from 'expo-constants';

const { apiUrl } = getEnvVars();

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: { 'X-CO-UUID': Constants.installationId },
});
