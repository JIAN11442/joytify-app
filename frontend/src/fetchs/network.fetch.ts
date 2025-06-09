import API from "../config/api-client.config";
import { IPGeoLocation } from "@joytify/shared-types/types";

export const getIPAddressFromHeaders = async (): Promise<{ ip: string }> =>
  API.get("/network/ip/headers");

export const getIPAddressFromCloudflare = async (): Promise<{ ip: string }> =>
  API.get("/network/ip/cloudflare");

export const getIPGeoLocation = async (ip: string): Promise<IPGeoLocation> =>
  API.get(`/network/ip/${ip}/geo`);

export const getCurrentIPGeoLocation = async (): Promise<IPGeoLocation> => {
  const { ip } = await getIPAddressFromCloudflare();
  const geoLocation = await getIPGeoLocation(ip);

  return geoLocation;
};
