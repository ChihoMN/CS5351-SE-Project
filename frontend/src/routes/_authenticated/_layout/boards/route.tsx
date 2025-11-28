import {createFileRoute, linkOptions} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {BoardList} from "@/features/boards/board-list";
import {BoardActions} from "@/features/boards/board-actions";
import {ModalProvider} from "@/state/modals";
import {CreateBoardButton} from "@/features/boards/create-board-button";
import {OtherActions} from "@/features/boards/other-boards-actions";
import {useZ} from "@/lib/zero-cache";
import {getBoardsListQuery} from "@/lib/zero-queries";
import {useAuthData} from "@/queries/session";
import {FocusScope} from "@/components/focus-scope";

export const Route = createFileRoute("/_authenticated/_layout/boards")({
  component: BoardsPage,
  loader: () => {
    return {
      breadcrumbs: linkOptions([
        {
          label: "Boards",
          to: "/boards",
        },
      ]),
    };
  },
  head(ctx) {
    return {
      meta: [{title: "Boards"}],
    };
  },
});

function BoardsPage() {
  const z = useZ();
  const boardsQuery = getBoardsListQuery(z);
  const [boards] = useQuery(boardsQuery);
  const userData = useAuthData();
  const isMember = userData.role === "member";

  return (
    <ModalProvider>
      <div className="container mx-auto px-8 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Boards ({boards.length || 0})
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and organize your boards
              </p>
            </div>

            {!isMember && (
              <div className="flex items-center gap-3">
                <CreateBoardButton />
                <OtherActions />
              </div>
            )}
          </div>

          {boards.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h1 className="text-xl font-bold mb-1">No boards yet</h1>
              <p className="text-muted-foreground mb-4 text-sm">
                Create your first board to get started!
              </p>

              <CreateBoardButton />
            </div>
          ) : (
            <FocusScope
              shortcutType="list"
              eventListenerType="document"
              autoFocusElementIndexOnMount={0}
            >
              <BoardList boards={boards} readonly={isMember} />
            </FocusScope>
          )}
        </div>
      </div>
      <BoardActions />
    </ModalProvider>
  );
}
