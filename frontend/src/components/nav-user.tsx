"use client";

import {ChevronsUpDown, Lock, LogOut, Settings} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {Link} from "@tanstack/react-router";
import {handleAuthResponse} from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuthData} from "@/queries/session";
import {authClient} from "@/lib/auth";
import {getOrigin} from "@/lib/constants";
import {router} from "@/main";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {Dialog} from "@/components/ui/dialog";
import UserAvatar from "@/components/user-avatar";

export function NavUser() {
  const userData = useAuthData();
  const {isMobile} = useSidebar();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      return handleAuthResponse(res);
    },
    onSuccess: () => {
      localStorage.removeItem("auth-token");
      router.navigate({to: "/login", reloadDocument: true});
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.forgetPassword({
        email: userData.email,
        redirectTo: `${getOrigin()}/reset-password`,
      });
      return handleAuthResponse(res);
    },
  });

  const handleLogout = () => {
    toast.promise(() => logoutMutation.mutateAsync(), {
      loading: "Logging out...",
      success: "Logged out successfully",
      error: "Failed to log out",
    });
  };

  const handleResetPassword = () => {
    toast.promise(() => forgotPasswordMutation.mutateAsync(), {
      loading: "Sending reset password email...",
      success:
        "Reset password email sent successfully, please check your email.",
      error: "Failed to send reset password email",
      position: "top-center",
    });
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-0!"
                >
                  <UserAvatar name={userData.name} imageUrl={userData.image} />

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-medium truncate">
                      {userData.name}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56"
                align="start"
                side={isMobile ? "top" : "right"}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserAvatar
                      name={userData.name}
                      imageUrl={userData.image}
                    />

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userData.name}
                      </span>
                      <span className="truncate text-xs">{userData.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleResetPassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
