import {createFileRoute} from "@tanstack/react-router";
import {UserSettings} from "@/features/user/user-settings";

export const Route = createFileRoute("/_authenticated/settings")({
  component: RouteComponent,
  head(ctx) {
    return {
      meta: [{title: "Settings | KanBased"}],
    };
  },
});

function RouteComponent() {
  return <UserSettings />;
}
