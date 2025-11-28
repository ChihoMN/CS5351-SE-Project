import {Trash2} from "lucide-react";
import {useZ} from "@/lib/zero-cache";
import {cn} from "@/lib/utils";

export function DeleteColumn({
  columnId,
  onClick,
  className,
  ...rest
}: React.ComponentProps<"button"> & {columnId: string}) {
  const z = useZ();

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    z.mutate.columnsTable.update({
      id: columnId,
      deletedAt: Date.now(),
    });
  };

  return (
    <button
      onClick={handleDelete}
      type="button"
      className={cn(
        className,
        "!text-destructive focus:text-destructive focus:bg-destructive/10",
      )}
      {...rest}
    >
      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
      Delete Column
    </button>
  );
}
