import {useCanGoBack, useRouter} from "@tanstack/react-router";
import {ArrowLeft} from "lucide-react";
import type {ButtonVariant} from "@/components/ui/button";
import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";

export function BackButton(
  props: React.PropsWithChildren<{
    variant?: ButtonVariant;
    className?: string;
  }>,
) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={props.variant ?? "ghost"}
            size={props.children ? "default" : "icon"}
            type="button"
            onClick={() => router.history.back()}
            className={cn("h-8", props.className)}
            aria-label="Go back"
            disabled={!canGoBack}
          >
            <ArrowLeft />
            {props.children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go back</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
