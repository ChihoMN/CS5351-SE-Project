import {useEffect} from "react";

import {createFileRoute, useNavigate, useRouter} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {useZ} from "@/lib/zero-cache";
import {getNoteQuery} from "@/lib/zero-queries";
import EditNote from "@/features/notes/edit-note";
import {promiseTimeout} from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_layout/notes/$noteId")({
  component: RouteComponent,

  context: () => {
    let _noteTitle = "";
    return {
      getNoteTitle: () => _noteTitle,
      setNoteTitle: (title: string) => {
        _noteTitle = title;
      },
    };
  },

  head(ctx) {
    const noteTitle: string = ctx.match.context.getNoteTitle();

    return {
      meta: [{title: noteTitle}],
    };
  },
});

function RouteComponent() {
  const {noteId} = Route.useParams();
  const z = useZ();
  const [note] = useQuery(getNoteQuery(z, noteId));
  const navigate = useNavigate();
  const router = useRouter();
  const routeCtx = Route.useRouteContext();

  useEffect(() => {
    if (note?.name) {
      routeCtx.setNoteTitle(note.name);
      router.invalidate();
    }
  }, [note?.name]);

  if (note === undefined) {
    return null;
  }

  const goToNotes = async () => {
    await navigate({to: "/notes"});
    await promiseTimeout(100);
    document.getElementById(`note-item-${noteId}`)?.focus();
  };

  return <EditNote note={note} onClose={goToNotes} />;
}
