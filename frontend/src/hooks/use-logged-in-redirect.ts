import {useRouter} from "@tanstack/react-router";
import {useEffect} from "react";
import {fetchSession} from "@/queries/session";

export function useLoggedInRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetchSession()
      .then((data) => {
        // @typescript-eslint/no-unnecessary-condition
        if (data?.session) {
          router.navigate({to: "/"});
        }
      })
      .catch(() => {});
  }, []);
}
