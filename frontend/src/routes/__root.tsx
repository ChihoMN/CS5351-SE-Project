import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {lazy} from "react";
import {AppContextProvider} from "@/state/app-state";
import {Toaster} from "@/components/ui/sonner";

const TanStackRouterDevtools =
  // @ts-ignore - This is a workaround to avoid the devtools from being bundled in production
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

interface MyRouterContext {}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  head(ctx) {
    return {
      meta: [{title: "KanBased"}],
    };
  },
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <AppContextProvider>
        <Outlet />
        <Toaster closeButton />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools position="bottom" />
      </AppContextProvider>
    </>
  );
}
