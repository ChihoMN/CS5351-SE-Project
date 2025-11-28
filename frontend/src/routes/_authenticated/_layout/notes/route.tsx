import {
  Outlet,
  createFileRoute,
  linkOptions,
  useRouter,
} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {useHotkeys} from "react-hotkeys-hook";
import {Actions} from "./-actions";
import {CreateNoteButton} from "@/features/notes/create-note-button";
import {ModalProvider} from "@/state/modals";
import {NoteList} from "@/features/notes/note-list";
import {getNotesListQuery} from "@/lib/zero-queries";
import {useZ} from "@/lib/zero-cache";
import {useAuthData} from "@/queries/session";
import {FocusScope} from "@/components/focus-scope";

export const Route = createFileRoute("/_authenticated/_layout/notes")({
  component: RouteComponent,

  loader: () => {
    return {
      breadcrumbs: linkOptions([
        {
          label: "Notes",
          to: "/notes",
        },
      ]),
    };
  },

  validateSearch: (search): {createNote?: boolean} => {
    return {
      createNote:
        typeof search.createNote === "boolean" ? search.createNote : undefined,
    };
  },

  head(ctx) {
    return {
      meta: [{title: "Notes"}],
    };
  },
});

function RouteComponent() {
  const router = useRouter();
  const z = useZ();
  const [notes] = useQuery(getNotesListQuery(z));
  const userData = useAuthData();
  const isMember = userData.role === "member";
  const params: Record<string, any> = Route.useParams();

  const handleCreateNote = () => {
    router.navigate({to: ".", search: {createNote: true}});
  };

  useHotkeys(
    "a",
    () => {
      if (!params.noteId) {
        handleCreateNote();
      }
    },
    {
      preventDefault: true,
    },
    [params.noteId],
  );

  return (
    <ModalProvider>
      <div className="container mx-auto px-8 py-8 w-full">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Notes ({notes.length})
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and organize your notes
              </p>
            </div>

            {!isMember && (
              <div className="flex items-center gap-3">
                <CreateNoteButton onClick={handleCreateNote} />
              </div>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h1 className="text-xl font-bold mb-1">No notes yet</h1>
              <p className="text-muted-foreground mb-4 text-sm">
                Create your first note to get started!
              </p>

              <CreateNoteButton onClick={handleCreateNote} />
            </div>
          ) : (
            <FocusScope
              autoFocusElementIndexOnMount={0}
              shortcutType="list"
              eventListenerType="parent"
            >
              <NoteList notes={notes} readonly={isMember} />
            </FocusScope>
          )}
        </div>
      </div>

      <Actions />
      <Outlet />
    </ModalProvider>
  );
}
