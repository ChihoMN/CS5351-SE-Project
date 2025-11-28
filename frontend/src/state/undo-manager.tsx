import {createContext, use, useMemo} from "react";
import {UndoManager} from "@rocicorp/undo";
import {useHotkeys} from "react-hotkeys-hook";

const UndoManagerContext = createContext<UndoManager | null>(null);

export function UndoManagerProvider(
  props: React.PropsWithChildren<{
    disabled?: boolean;
  }>,
) {
  const undoManager = useMemo(() => new UndoManager(), []);

  useHotkeys(
    "mod+z",
    () => {
      if (props.disabled) {
        return;
      }

      undoManager.undo();
    },
    {
      preventDefault: true,
    },
  );

  return (
    <UndoManagerContext value={undoManager}>
      {props.children}
    </UndoManagerContext>
  );
}

export function useUndoManager() {
  const undoManager = use(UndoManagerContext);

  if (!undoManager) {
    throw new Error(
      "useUndoManager must be used within an UndoManagerProvider",
    );
  }

  return undoManager;
}
