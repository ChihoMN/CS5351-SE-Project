import {CirclePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuthData} from "@/queries/session";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";

export function CreateNoteButton({
  size,
  onClick,
}: {
  size?: "sm" | "lg";
  onClick: () => void;
}) {
  const userData = useAuthData();
  const isMember = userData.role === "member";

  if (isMember) {
    return null;
  }

  return (
    <Button
      id="create-note-button"
      size={size}
      onClick={onClick}
      className="gap-2"
    >
      <CirclePlus className="w-5 h-5" />
      Create Note
      <KeyboardShortcutIndicator>A</KeyboardShortcutIndicator>
    </Button>
  );
}
