import {queryOptions} from "@tanstack/react-query";
import {jwtDecode} from "jwt-decode";
import type {AuthJwtPayload} from "@/types/api-response-types";
import {authClient} from "@/lib/auth";
import {AuthError} from "@/lib/utils";

export const authQueryOptions = queryOptions({
  queryKey: ["auth"],
  queryFn: async ({client: qc}) => {
    let encodedToken = localStorage.getItem("auth-token");
    const queryState = qc.getQueryState(authQueryOptions.queryKey);

    if (queryState?.isInvalidated || !encodedToken) {
      const {data, error} = await authClient.$fetch<{token: string}>("/token", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!data || !data.token || error) {
        throw new AuthError({
          status: 401,
          statusText: "Unauthorized",
        });
      }

      encodedToken = data.token;
    }

    let decodedData: AuthJwtPayload;

    try {
      decodedData = jwtDecode(encodedToken);
    } catch (err) {
      throw new AuthError({
        status: 401,
        statusText: "Error decoding token",
      });
    }

    localStorage.setItem("auth-token", encodedToken);

    return {
      encodedToken,
      decodedData,
    };
  },
  retry: false,
  staleTime: Infinity,
});
