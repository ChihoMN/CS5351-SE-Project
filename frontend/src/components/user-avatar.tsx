import {useMemo} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getColorFromName, getInitials} from "@/lib/helpers";

function UserAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string;
  className?: string;
}) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColorFromName(name), [name]);

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback
        className="text-white text-xs"
        style={{backgroundColor: bgColor}}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
