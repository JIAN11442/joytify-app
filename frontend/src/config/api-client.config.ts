/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosRequestConfig } from "axios";

import queryClient from "./query-client.config";
import { navigate } from "../lib/navigate.lib";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";

const { AUTH } = API_ENDPOINTS;

const options: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
};

// API for axios
const API = axios.create(options);
const RefreshTokensClient = axios.create(options);
const Unauthorized = document.cookie.includes("unauthorized");
const pathName = window.location.pathname;

let refreshPromise: Promise<void> | null = null;
let isWarningUnauthorized = false;

// API for refresh
RefreshTokensClient.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response.data.message)
);

// response interceptor (controll return data of the API)
API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (err) => {
    const { response, config } = err;
    const { status, data } = response;

    // if got an error with status 401 and errorCode is InvalidAccessToken
    // that means the access token is expired, so we need to refresh the tokens to login in back screen
    if (status === 401) {
      if (data?.errorCode === "InvalidAccessToken") {
        try {
          if (!refreshPromise) {
            refreshPromise = RefreshTokensClient.post(`${AUTH}/refresh`);
          }

          await refreshPromise;
          refreshPromise = null;

          return API(config);
        } catch (error) {
          // if refresh token failed, clear the query cache
          queryClient.clear();

          // if the current path is not /search or /password/reset,
          if (pathName !== "/search" && pathName !== "/password/reset") {
            // navigate to homepage and save currrent path to redirect url
            // so we can redirect user to the current page after login
            navigate("/", { state: { redirectUrl: window.location.pathname } });
          }
        }
      }

      // warning
      if (Unauthorized && !isWarningUnauthorized) {
        console.warn("🔑 Unauthorized!");
        isWarningUnauthorized = true;
      }
    }

    return Promise.reject({ status, ...data });
  }
);

export default API;
