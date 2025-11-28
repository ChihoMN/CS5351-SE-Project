import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import type {QueryClient} from "@tanstack/react-query";
import {authClient} from "@/lib/auth";
import {authQueryOptions} from "@/lib/query-options-factory";
import {AuthError} from "@/lib/utils";

export async function fetchSession() {
  const {data, error} = await authClient.getSession();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AuthError({
      status: 401,
      statusText: "Unauthorized",
    });
  }

  return data;
}

export function getAuthData(queryClient: QueryClient) {
  const queryData = queryClient.getQueryData(authQueryOptions.queryKey);

  if (!queryData) {
    throw new Error("Auth detail not found while calling getAuthData");
  }

  return queryData;
}

export function useAuthData() {
  const {data} = useSuspenseQuery(authQueryOptions);
  return data.decodedData;
}

export function getActiveOrganizationId(queryClient: QueryClient) {
  const {decodedData} = getAuthData(queryClient);
  return decodedData.activeOrganizationId;
}

export function useActiveOrganizationId() {
  const queryClient = useQueryClient();
  return getActiveOrganizationId(queryClient);
}
