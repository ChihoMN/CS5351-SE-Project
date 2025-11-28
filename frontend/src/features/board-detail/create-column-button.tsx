import {Grid2x2Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {WrappedTooltip} from "@/components/ui/tooltip";
import {useColumnModalControls} from "@/features/board-detail/column.state";

export function CreateColumnButton() {
  const {openModal} = useColumnModalControls();

  return (
    <WrappedTooltip
      asChild
      tooltipContentProps={{side: "bottom"}}
      tooltipProps={{delayDuration: 0}}
    >
      <Button
        onClick={() => openModal({type: "create-column"})}
        size="icon"
        className="w-8 h-8 shrink-0"
        aria-label="Add column"
      >
        <Grid2x2Plus />
      </Button>
      <span>Create Column</span>
    </WrappedTooltip>
  );
}
