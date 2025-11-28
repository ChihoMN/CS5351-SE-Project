import {EllipsisVertical, Trash2} from "lucide-react";
import {useRouter} from "@tanstack/react-router";
import type {GetBoardsListQueryResult} from "@/lib/zero-queries";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useColumnModalControls,
  useColumnModalState,
} from "@/features/board-detail/column.state";
import {DeleteBoard} from "@/features/boards/delete-board";

export function OtherActions({
  board,
}: {
  board: GetBoardsListQueryResult[number];
}) {
  const {activeModal} = useColumnModalState();
  const {openModal, closeModal} = useColumnModalControls();
  const router = useRouter();

  const handleBoardDelete = () => {
    openModal({
      type: "delete-board",
      board,
      onClose: () => {
        closeModal();
      },

      onDeleteSuccess: () => {
        closeModal();
        router.navigate({
          to: "/boards",
        });
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="w-8 h-8">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleBoardDelete}
            className="!text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            Delete board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {activeModal?.type === "delete-board" && <DeleteBoard {...activeModal} />}
    </>
  );
}
