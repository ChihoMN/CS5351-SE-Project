import {useCallback, useRef} from "react";
import type {GetTaskQueryResult} from "@/lib/zero-queries";
import {CustomizedTextarea} from "@/components/ui/customized-textarea";
import {useInteractiveOutside} from "@/hooks/use-interactive-outside";
import {useZ} from "@/lib/zero-cache";
import {useUndoManager} from "@/state/undo-manager";

export type EditTaskProps = {
  task: NonNullable<GetTaskQueryResult>;
  onComplete: () => void;
  className?: string;
};

export function EditTask(props: EditTaskProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const z = useZ();
  const undoManager = useUndoManager();

  useInteractiveOutside(textAreaRef, () => {
    props.onComplete();
  });

  const handleSubmit = () => {
    const execute = () => {
      z.mutate.tasksTable.update({
        id: props.task.id,
        name: textAreaRef.current!.value,
        updatedAt: Date.now(),
      });
    };

    const undo = () => {
      z.mutate.tasksTable.update({
        id: props.task.id,
        name: props.task.name,
        updatedAt: props.task.updatedAt,
      });
    };

    undoManager.add({
      execute,
      undo,
    });

    props.onComplete();
  };

  return (
    <div className={props.className}>
      <form>
        <CustomizedTextarea
          name="task"
          ref={useCallback((node: HTMLTextAreaElement | null) => {
            textAreaRef.current = node;

            if (node) {
              node.focus();
              node.setSelectionRange(node.value.length, node.value.length);
              node.scrollIntoView({block: "nearest", behavior: "smooth"});
            }
          }, [])}
          defaultValue={props.task.name}
          required
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (event.shiftKey) {
                return;
              }

              handleSubmit();
            }
            if (event.key === "Escape") {
              props.onComplete();
            }
          }}
          className="min-h-17.5 px-2! resize-none ring-transparent! text-base!"
        />
      </form>
    </div>
  );
}
