import {useRef} from "react";
import type {FormEvent} from "react";
import {Button} from "@/components/ui/button";
import {CustomizedTextarea} from "@/components/ui/customized-textarea";
import {useInteractiveOutside} from "@/hooks/use-interactive-outside";
import {createId} from "@/lib/utils";
import {useZ} from "@/lib/zero-cache";
import {useActiveOrganizationId} from "@/queries/session";
import {isMac} from "@/lib/constants";

type InsertPosition = "append" | "prepend";

export type CreateCardProps = {
  columnId: string;
  nextPosition: number;
  firstPosition: number;
  onComplete: () => void;
  onAdd: (insertPosition: InsertPosition) => void;
};

export function CreateTask(props: CreateCardProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const z = useZ();
  const organizationId = useActiveOrganizationId();
  const insertPosition = useRef<InsertPosition>("append");

  useInteractiveOutside(wrapperRef, () => {
    props.onComplete();
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = textAreaRef.current!.value;
    textAreaRef.current!.value = "";

    await z.mutate.tasksTable.insert({
      id: createId(),
      columnId: props.columnId,
      name,
      position:
        insertPosition.current === "prepend"
          ? props.firstPosition - 1
          : props.nextPosition,
      createdAt: Date.now(),
      creatorId: z.userID,
      assigneeId: z.userID,
      organizationId,
    });

    props.onAdd(insertPosition.current);
  };

  return (
    <div ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <CustomizedTextarea
          name="task"
          ref={textAreaRef}
          required
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (event.shiftKey) return;
              if (event.metaKey || event.ctrlKey) {
                insertPosition.current = "prepend";
              } else {
                insertPosition.current = "append";
              }
              buttonRef.current!.click();
            }
            if (event.key === "Escape") {
              props.onComplete();
            }
          }}
          autoFocus
          className="min-h-17.5 px-2! resize-none overflow-hidden ring-transparent! text-base! placeholder:text-xs"
          placeholder={`↵ to append, ${isMac ? "⌘" : "Ctrl"}↵ to prepend`}
          title={`Add task, Enter to append, ${isMac ? "⌘" : "Ctrl"}Enter to prepend`}
        />
        <div className="flex gap-4 w-fit ml-auto">
          <Button
            onClick={props.onComplete}
            type="button"
            variant="ghost"
            size="sm"
          >
            Cancel
          </Button>

          <Button ref={buttonRef} type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
