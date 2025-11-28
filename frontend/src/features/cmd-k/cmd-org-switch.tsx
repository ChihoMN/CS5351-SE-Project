"use client";

import {Check} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";

import {useQuery} from "@rocicorp/zero/react";
import type {GetOrganizationListQueryResult} from "@/lib/zero-queries";
import type {AuthJwtPayload} from "@/types/api-response-types";
import {CommandItem, CommandSubtitle} from "@/components/ui/command";
import {useZ} from "@/lib/zero-cache";
import {getOrganizationListQuery} from "@/lib/zero-queries";
import {useAuthData} from "@/queries/session";
import {authClient} from "@/lib/auth";
import {handleAuthResponse} from "@/lib/utils";
import OrgAvatar from "@/components/org-avatar";

export function CommandOrgSwitch() {
  const z = useZ();
  const userData = useAuthData();
  const [organizationsList] = useQuery(getOrganizationListQuery(z));

  const switchOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await authClient.organization.setActive({
        organizationId,
      });
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      localStorage.removeItem("auth-token");
      window.location.href = "/";
    },
  });

  const handleSwitchOrganization = (organizationId: string) => {
    const promise = switchOrganizationMutation.mutateAsync(organizationId);
    toast.promise(promise, {
      loading: "Switching organization...",
      error: "Failed to switch organization",
      position: "top-center",
    });
  };

  return (
    <>
      {organizationsList.map((org, index) => (
        <CommandOrgItem
          key={org.id}
          org={org}
          userData={userData}
          onSelect={() => handleSwitchOrganization(org.id)}
        />
      ))}
    </>
  );
}

function CommandOrgItem(props: {
  org: NonNullable<NonNullable<GetOrganizationListQueryResult[number]>>;
  onSelect: () => void;
  userData: AuthJwtPayload;
}) {
  return (
    <CommandItem onSelect={props.onSelect}>
      <OrgAvatar name={props.org.name} imageUrl={props.org.logo} />
      <span>{props.org.name}</span>
      {props.org.id === props.userData.activeOrganizationId && (
        <CommandSubtitle className="shrink-0">
          <Check className="h-4 w-4" />
        </CommandSubtitle>
      )}
    </CommandItem>
  );
}
