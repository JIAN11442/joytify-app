import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import { IPGeoLocation } from "@joytify/shared-types/types";

const { NETWORK } = API_ENDPOINTS;

export const getIPAddressFromHeaders = async (): Promise<{ ip: string }> =>
  API.get(`${NETWORK}/ip/headers`);

export const getIPAddressFromCloudflare = async (): Promise<{ ip: string }> =>
  API.get(`${NETWORK}/ip/cloudflare`);

export const getIPGeoLocation = async (ip: string): Promise<IPGeoLocation> =>
  API.get(`${NETWORK}/ip/${ip}/geo`);

export const getCurrentIPGeoLocation = async (): Promise<IPGeoLocation> => {
  const { ip } = await getIPAddressFromCloudflare();
  const geoLocation = await getIPGeoLocation(ip);

  return geoLocation;
};
