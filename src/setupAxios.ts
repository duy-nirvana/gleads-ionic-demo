import axios, {
  Axios,
  AxiosDefaults,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

export function setupAxios(axios: Axios) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Modify request config (e.g., add auth token to headers)
      // const token = getCookie('access_token'); // Example: getting token from localStorage
      // if (token) {
      // }
      config.headers["Content-Type"] = "application/json";
      config.headers.Authorization = `Bearer ${import.meta.env.VITE_API_TOKEN}`;
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response: any) => response.data,
    (error: AxiosError) => {
      const response = error.response;
      switch (response!.status) {
        // Handle unauthorized errors, for example, by redirecting to login
        case 401:
          // store.dispatch(clearAuthData());
          // window.location.href = '/auth/login';
          break;
        default:
          break;
      }
      return Promise.reject(error);
    }
  );
}
