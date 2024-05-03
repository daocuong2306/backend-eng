import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { env } from './env';

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.API_KEY,
  },
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
