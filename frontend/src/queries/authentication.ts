import {useMutation} from "@tanstack/react-query";
import {useLinkProps} from "@tanstack/react-router";
import {authClient} from "@/lib/auth";
import {handleAuthResponse} from "@/lib/utils";
import {getOrigin} from "@/lib/constants";

export function useGoogleLoginMutation({callbackURL}: {callbackURL: string}) {
  const link = useLinkProps({to: "/login"});

  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL: `${getOrigin()}${link.href}`,
      });
      return handleAuthResponse(res);
    },
  });
}

export function useGithubLoginMutation({callbackURL}: {callbackURL: string}) {
  const link = useLinkProps({to: "/login"});

  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signIn.social({
        provider: "github",
        callbackURL,
        errorCallbackURL: `${getOrigin()}${link.href}`,
      });
      return handleAuthResponse(res);
    },
  });
}
