import {MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {Link} from "@tanstack/react-router";
import type {GetBoardsListQueryResult} from "@/lib/zero-queries";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useBoardModalControls} from "@/features/boards/board.state";
import {getRelativeTimeString} from "@/lib/utils";

function BoardItem({
  board,
  readonly,
}: {
  board: GetBoardsListQueryResult[number];
  readonly: boolean;
}) {
  const {openModal, closeModal} = useBoardModalControls();

  return (
    <Link
      to="/boards/$boardId"
      params={{boardId: board.id}}
      className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-lg 
      default-focus-ring"
      data-kb-focus
    >
      <div className="relative p-6">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/10 opacity-30 transition-opacity group-hover:opacity-70" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-xl tracking-tight line-clamp-1">
              {board.name}
            </h3>
            {!readonly && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      openModal({
                        type: "edit-board",
                        board,
                        onClose: closeModal,
                      });
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="!text-destructive focus:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal({
                        type: "delete-board",
                        board,
                        onClose: closeModal,
                        onDeleteSuccess: closeModal,
                      });
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Stats */}
          {/* <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{board.columnsCount ?? 0} columns</span>
              <span className="mx-2">•</span>
              <span>{board.tasksCount ?? 0} tasks</span>
            </div>
          </div> */}

          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              Created {getRelativeTimeString(new Date(board.createdAt))}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BoardList(props: {
  boards: GetBoardsListQueryResult;
  readonly: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.boards.map((board) => (
        <BoardItem board={board} key={board.id} readonly={props.readonly} />
      ))}
    </ul>
  );
}
