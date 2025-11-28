import {Link} from "@tanstack/react-router";
import {toast} from "sonner";
import type {FormEventHandler} from "react";
import type {CreateBoardModal} from "@/features/boards/board.state";
import {Button, buttonVariants} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {createId} from "@/lib/utils";
import {useZ} from "@/lib/zero-cache";
import {useActiveOrganizationId} from "@/queries/session";

export function CreateBoard(props: CreateBoardModal) {
  const z = useZ();
  const activeOrganizationId = useActiveOrganizationId();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const boardId = createId();
    const boardName = fd.get("board-name") as string;
    const slug = boardName.toLowerCase().split(" ").join("-");

    z.mutateBatch(async (m) => {
      await m.boardsTable.insert({
        id: boardId,
        name: boardName,
        slug,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        creatorId: z.userID,
        organizationId: activeOrganizationId,
      });

      for (let i = 1; i <= 3; i++) {
        await m.columnsTable.insert({
          id: createId(),
          boardId: boardId,
          name: i === 1 ? "To Do" : i === 2 ? "In Progress" : "Done",
          position: i,
          createdAt: Date.now(),
          organizationId: activeOrganizationId,
          creatorId: z.userID,
        });
      }
    });

    toast.success(
      <div className="flex items-center justify-between w-full">
        <span>
          <b>{boardName}</b> board created successfully
        </span>
        <Link
          className={buttonVariants({
            size: "sm",
            className: "h-8!",
          })}
          to="/boards/$boardId"
          params={{boardId}}
        >
          View
        </Link>
      </div>,
    );

    props.onClose();
  };

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent className="gap-0! sm:max-w-[425px]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 mt-4 mb-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              name="board-name"
              placeholder="eg: work board"
              required
            />
            <DialogDescription className="text-xs!">
              Enter a unique name that reflects the purpose of this board.
            </DialogDescription>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-[72px]">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
