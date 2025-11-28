import {toast} from "sonner";
import type {FormEventHandler} from "react";
import type {EditBoardModal} from "@/features/boards/board.state";
import {Button} from "@/components/ui/button";
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
import {useZ} from "@/lib/zero-cache";

export function EditBoard(props: EditBoardModal) {
  const {board} = props;
  const z = useZ();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    const fd = new FormData(e.target as HTMLFormElement);
    const boardName = fd.get("board-name") as string;
    const slug = boardName.toLowerCase().split(" ").join("-");

    z.mutate.boardsTable.update({
      id: board.id,
      name: boardName,
      slug,
      updatedAt: Date.now(),
    });

    toast.success("Board updated successfully");

    props.onClose();
  };

  const handleOpenChange = () => {
    props.onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0! sm:max-w-[425px]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit board</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 mt-4 mb-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              name="board-name"
              placeholder="eg: work board"
              required
              defaultValue={board.name}
            />
            <DialogDescription className="text-xs!">
              Enter a unique name that reflects the purpose of this board.
            </DialogDescription>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-[72px]">
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
