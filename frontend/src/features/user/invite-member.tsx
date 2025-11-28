import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useRef} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {authClient} from "@/lib/auth";
import {cn, handleAuthResponse} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useAuthData} from "@/queries/session";

export function InviteMemberDialog() {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const userData = useAuthData();
  const isMember = userData.role === "member";

  const inviteMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: "member" | "admin";
    }) => {
      const res = await authClient.organization.inviteMember({
        email,
        role,
      });
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      closeButtonRef.current?.click();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as "member" | "admin";

    if (!email) return;
    inviteMutation.mutate({email, role});
  };

  return (
    <DialogContent>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="email">Invite Member</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            required
            disabled={inviteMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <RoleSelect
            defaultValue={isMember ? "member" : "admin"}
            disabled={isMember}
          />
          <p className="text-sm text-muted-foreground">
            Choose the role for the invited user
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button ref={closeButtonRef} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending && <Spinner />}
            Send Invitation
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function RoleSelect({
  value,
  onChange,
  className,
  disabled,
  defaultValue,
}: {
  value?: "member" | "admin" | "owner";
  onChange?: (value: "member" | "admin" | "owner") => void;
  className?: string;
  disabled?: boolean;
  defaultValue?: "member" | "admin" | "owner";
}) {
  return (
    <div className={cn("relative w-[110px]", className)}>
      <select
        name="role"
        value={value}
        onChange={
          onChange
            ? (e) => onChange(e.target.value as "member" | "admin" | "owner")
            : undefined
        }
        className="appearance-none border rounded px-2 py-1 bg-muted-foreground/10 w-full pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={disabled}
        defaultValue={defaultValue}
      >
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 8L10 12L14 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
