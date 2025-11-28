import {useQuery} from "@rocicorp/zero/react";
import {createFileRoute, useRouter} from "@tanstack/react-router";
import {Trash2} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {useZ} from "@/lib/zero-cache";
import {
  getOrganizationListQuery,
  getOrganizationMembersQuery,
  getOrganizationQuery,
} from "@/lib/zero-queries";
import {useActiveOrganizationId, useAuthData} from "@/queries/session";
import UserAvatar from "@/components/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrgAvatar from "@/components/org-avatar";
import {Button} from "@/components/ui/button";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import {InviteMemberDialog, RoleSelect} from "@/features/user/invite-member";
import {authClient} from "@/lib/auth";
import {handleAuthResponse} from "@/lib/utils";
import {BackButton} from "@/components/back-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {EditableText} from "@/components/editable-text";

export const Route = createFileRoute("/_authenticated/workspace-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const orgId = useActiveOrganizationId();
  const z = useZ();
  const [myOrg] = useQuery(getOrganizationQuery(z, orgId));
  const [members] = useQuery(getOrganizationMembersQuery(z, orgId));
  const [orgList] = useQuery(getOrganizationListQuery(z));
  const userData = useAuthData();
  const router = useRouter();
  const isMember = userData.role === "member";

  const removeMemberMutation = useMutation({
    mutationFn: async ({memberId}: {memberId: string}) => {
      const result = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });

      return handleAuthResponse(result);
    },
  });

  const changeMemberRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "member" | "admin" | "owner";
    }) => {
      const result = await authClient.organization.updateMemberRole({
        role: role,
        memberId,
      });

      return handleAuthResponse(result);
    },
    onSuccess: async (member) => {
      if (member?.id === userData.id) {
        localStorage.removeItem("auth-token");
        router.navigate({to: ".", reloadDocument: true});
      }
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.delete({
        organizationId: orgId,
      });

      return handleAuthResponse(result);
    },
    onSuccess: async () => {
      const otherOrg = orgList.find((org) => org.id !== orgId);

      if (otherOrg) {
        await authClient.organization.setActive({
          organizationId: otherOrg.id,
        });
      }

      localStorage.removeItem("auth-token");
      router.navigate({to: "/", reloadDocument: true});
    },
  });

  const changeWorkspaceNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await authClient.organization.update({
        organizationId: orgId,
        data: {
          name,
        },
      });

      return handleAuthResponse(result);
    },
  });

  if (!myOrg) {
    return null;
  }

  const handleRemoveMember = (memberId: string) => {
    const removeMemberPromise = removeMemberMutation.mutateAsync({memberId});

    toast.promise(removeMemberPromise, {
      loading: "Removing member...",
      success: "Member removed",
      error: "Failed to remove member",
      position: "top-center",
    });
  };

  const handleDeleteWorkspace = () => {
    const deleteWorkspacePromise = deleteWorkspaceMutation.mutateAsync();

    toast.promise(deleteWorkspacePromise, {
      loading: "Deleting workspace...",
      success: "Workspace deleted",
      error: "Failed to delete workspace",
      position: "top-center",
    });
  };

  const handleChangeMemberRole = (
    memberId: string,
    role: "member" | "admin" | "owner",
  ) => {
    const changeMemberRolePromise = changeMemberRoleMutation.mutateAsync({
      memberId,
      role,
    });

    toast.promise(changeMemberRolePromise, {
      loading: "Changing member role...",
      success: "Member role changed",
      error: "Failed to change member role",
      position: "top-center",
    });
  };

  const handleChangeWorkspaceName = (value: string) => {
    const changeWorkspaceNamePromise =
      changeWorkspaceNameMutation.mutateAsync(value);

    toast.promise(changeWorkspaceNamePromise, {
      loading: "Changing workspace name...",
      success: "Workspace name changed",
      error: "Failed to change workspace name",
      position: "top-center",
    });
  };

  return (
    <div>
      <BackButton className="m-4" variant="outline">
        Back to workspace
      </BackButton>
      <div className="max-w-lg mx-auto mt-10">
        <Card className="mb-8 border shadow-md">
          <CardHeader>
            <div className="flex flex-row items-center gap-4 pb-4">
              <OrgAvatar
                name={myOrg?.name}
                imageUrl={myOrg?.logo}
                className="size-16"
              />
              <div>
                <EditableText
                  fieldName="name"
                  inputClassName="text-2xl font-bold mb-1"
                  inputLabel="Workspace Name"
                  buttonClassName="text-3xl font-bold"
                  defaultValue={myOrg?.name}
                  onSubmit={handleChangeWorkspaceName}
                  defaultReadOnly={isMember}
                />
                <CardDescription className="text-sm text-muted-foreground">
                  Workspace ID:{" "}
                  <span className="font-mono text-sm px-1 py-0.5">
                    {myOrg.id}
                  </span>
                </CardDescription>
                <CardDescription className="text-sm text-muted-foreground">
                  Created at:{" "}
                  <span className="font-mono text-sm px-1 py-0.5">
                    {new Date(myOrg.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="w-fit ml-auto">
              {!isMember && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" size="sm" variant="destructive">
                      Delete workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete the workspace:{" "}
                        {myOrg.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will be permanent, You will not be able to
                        undo it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteWorkspace}
                        type="submit"
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>
                Invite your team members to collaborate.
              </CardDescription>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Invite Member
                </Button>
              </DialogTrigger>

              <InviteMemberDialog />
            </Dialog>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-2 rounded-lg transition"
                >
                  <UserAvatar
                    name={member.user?.name || "?"}
                    imageUrl={member.user?.image ?? undefined}
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-base">
                      {member.user?.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {member.user?.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RoleSelect
                      value={member.role as "member" | "admin" | "owner"}
                      onChange={(role) => {
                        handleChangeMemberRole(member.id, role);
                      }}
                      disabled={isMember}
                    />

                    {!isMember && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
