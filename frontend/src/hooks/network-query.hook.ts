import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentIPGeoLocation } from "../fetchs/network.fetch";
import { QueryKey } from "../constants/query-client-key.constant";

export const useGetIPAddressInfoQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: ipGeoLocationInfo, ...rest } = useQuery({
    queryKey: [QueryKey.GET_IP_GEOLOCATION],
    queryFn: async () => {
      try {
        return await getCurrentIPGeoLocation();
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { ipGeoLocationInfo, ...rest };
};
