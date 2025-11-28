import {CirclePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useBoardModalControls} from "@/features/boards/board.state";
import {useAuthData} from "@/queries/session";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";

export function CreateBoardButton({size}: {size?: "sm" | "lg"}) {
  const {openModal, closeModal} = useBoardModalControls();
  const userData = useAuthData();
  const isMember = userData.role === "member";

  if (isMember) {
    return null;
  }

  return (
    <Button
      size={size}
      onClick={() => openModal({type: "create-board", onClose: closeModal})}
      className="gap-2"
    >
      <CirclePlus className="w-5 h-5" />
      Create Board
      <KeyboardShortcutIndicator>A</KeyboardShortcutIndicator>
    </Button>
  );
}
