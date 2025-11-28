import {ZeroProvider as ZeroProviderComponent} from "@rocicorp/zero/react";
import {schema} from "../../../backend/zero-schema.gen";
import {getAuthData, useAuthData} from "@/queries/session";
import {queryClient} from "@/lib/query-client";
import {authQueryOptions} from "@/lib/query-options-factory";

export const auth = async (status: "invalid-token" | undefined) => {
  const authData = getAuthData(queryClient);

  if (!authData.encodedToken || status === "invalid-token") {
    await queryClient.invalidateQueries(authQueryOptions);
  }

  return getAuthData(queryClient).encodedToken;
};

export function ZeroProvider({children}: {children: React.ReactNode}) {
  const authData = useAuthData();
  return (
    <ZeroProviderComponent
      schema={schema}
      userID={authData.id}
      auth={auth}
      kvStore="idb"
      server={import.meta.env.CLIENT_PUBLIC_SERVER}
    >
      {children}
    </ZeroProviderComponent>
  );
}
