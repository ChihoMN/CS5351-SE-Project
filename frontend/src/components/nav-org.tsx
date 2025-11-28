"use client";

import {ArrowUpDown, Plus, UserPlus, Users} from "lucide-react";
import {Link} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {cn} from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuthData} from "@/queries/session";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {getOrganizationListQuery} from "@/lib/zero-queries";
import {useZ} from "@/lib/zero-cache";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import {InviteMemberDialog} from "@/features/user/invite-member";
import OrgAvatar from "@/components/org-avatar";
import {Button} from "@/components/ui/button";
import {useAppContext} from "@/state/app-state";
import {WrappedTooltip} from "@/components/ui/tooltip";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";

export function NavOrganization() {
  const userData = useAuthData();
  const z = useZ();
  const {isMobile} = useSidebar();
  const {state} = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [organizationsList] = useQuery(getOrganizationListQuery(z));
  const currentOrganization = organizationsList.find(
    (org) => org.id === userData.activeOrganizationId,
  );
  const {openOrgSwitch} = useAppContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <div className="flex items-center">
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-0!"
                >
                  <OrgAvatar
                    name={currentOrganization?.name ?? ""}
                    imageUrl={currentOrganization?.logo}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-medium truncate">
                      {currentOrganization?.name}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <WrappedTooltip asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(isSidebarCollapsed && "hidden")}
                  onClick={openOrgSwitch}
                >
                  <ArrowUpDown className="text-muted-foreground" />
                </Button>

                <KeyboardShortcutIndicator commandOrCtrlKey label="Shortcut">
                  o
                </KeyboardShortcutIndicator>
              </WrappedTooltip>
            </div>

            <DropdownMenuContent
              className="w-56"
              align="start"
              side={isMobile ? "bottom" : "right"}
            >
              <DropdownMenuLabel className="flex items-center gap-2">
                <OrgAvatar
                  name={currentOrganization?.name ?? ""}
                  imageUrl={currentOrganization?.logo}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium truncate">
                    {currentOrganization?.name}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/new-workspace">
                  <Plus className="mr-2 h-4 w-4" />
                  Create new workspace
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/workspace-settings">
                  <Users className="mr-2 h-4 w-4" />
                  Manage workspace
                </Link>
              </DropdownMenuItem>

              <DialogTrigger asChild>
                <DropdownMenuItem className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite member
                </DropdownMenuItem>
              </DialogTrigger>

              <DropdownMenuItem className="w-full" onClick={openOrgSwitch}>
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                Switch workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <InviteMemberDialog />
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
