import axios, { AxiosRequestConfig } from "axios";

import queryClient from "./query-client.config";
import { navigate } from "../lib/navigate.lib";

const options: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
};

// API for refresh
const RefreshTokensClient = axios.create(options);

RefreshTokensClient.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response.data.message)
);

// API for axios
const API = axios.create(options);

// response interceptor (controll return data of the API)
API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (err) => {
    const { response } = err;
    const { status, data, config } = response;

    // if got an error with status 401 and errorCode is InvalidAccessToken
    // that means the access token is expired, so we need to refresh the tokens to login in back screen
    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      try {
        // refresh tokens
        RefreshTokensClient.get("/auth/refresh");

        // retry the request to get current page data
        return RefreshTokensClient.request(config);
      } catch (error) {
        // if refresh token failed, clear the query cache
        queryClient.clear();

        // save currrent path to redirect url
        // so we can redirect user to the current page after login
        navigate("/", { state: { redirectUrl: window.location.pathname } });

        console.log(error);
      }
    }

    return Promise.reject({ status, ...data });
  }
);

export default API;
