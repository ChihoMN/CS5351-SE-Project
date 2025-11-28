import {useMemo} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getColorFromName, getInitials} from "@/lib/helpers";
import {cn} from "@/lib/utils";

function OrgAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColorFromName(name), [name]);

  return (
    <Avatar className={cn("rounded-md", className)}>
      <AvatarImage src={imageUrl ?? undefined} alt={name} />
      <AvatarFallback
        className="text-white rounded-md"
        style={{backgroundColor: bgColor}}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default OrgAvatar;
