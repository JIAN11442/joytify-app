import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { verifyResetPasswordLink } from "../fetchs/verification.fetch";
import { QueryKey } from "../constants/query-client-key.constant";

// verify reset password link
export const useVerifyResetPasswordLinkQuery = (
  token: string,
  delay: number = 0,
  opts: object = {}
) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: verified, ...rest } = useQuery({
    queryKey: [QueryKey.VERIFY_RESET_PASSWORD_LINK, token],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        return await verifyResetPasswordLink(token);
      } catch (error) {
        if (error) {
          setIsQueryError(true);
          return false;
        }
      }
    },
    staleTime: Infinity,
    enabled: Boolean(token) || !isQueryError,
    ...opts,
  });

  return { verified, ...rest };
};
