import {useState} from "react";
import {toast} from "sonner";
import {Check, Mail, X} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useAuthData} from "@/queries/session";
import {
  useUpdateUserMutation,
  useUploadUserImageMutation,
} from "@/queries/user";
import {Spinner} from "@/components/ui/spinner";
import {SettingsSidebar} from "@/features/user/settings-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {authClient} from "@/lib/auth";
import {getOrigin} from "@/lib/constants";
import {handleAuthResponse} from "@/lib/utils";
import {WrappedTooltip} from "@/components/ui/tooltip";

export function UserSettings() {
  const userData = useAuthData();
  const defaultUserImage = userData.image;
  const [previewUrl, setPreviewUrl] = useState(defaultUserImage);
  const uploadImageMutation = useUploadUserImageMutation();
  const updateUserMutation = useUpdateUserMutation();

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.sendVerificationEmail({
        email: userData.email,
        callbackURL: getOrigin(),
      });
      return handleAuthResponse(res);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");

    updateUserMutation.mutate(
      {
        name: name as string,
        image: previewUrl,
      },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous preview URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    uploadImageMutation.mutate(
      {file},
      {
        onSuccess: ({imageUrl}) => {
          setPreviewUrl(imageUrl);
        },
        onError: () => {
          setPreviewUrl(defaultUserImage);
        },
        onSettled: () => {
          URL.revokeObjectURL(url);
        },
      },
    );
  };

  const handleClear = () => {
    setPreviewUrl(defaultUserImage);
  };

  const handleVerifyEmail = () => {
    toast.promise(() => verifyEmailMutation.mutateAsync(), {
      loading: "Sending verification email...",
      success: "Verification email sent successfully, please check your email.",
      error: "Failed to send verification email",
      position: "bottom-center",
    });
  };

  return (
    <SidebarProvider className="relative">
      <SettingsSidebar />

      <div className="relative w-full">
        <div className="container max-w-2xl p-10 mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter mb-6">
              Profile
            </h1>
            <form
              onSubmit={handleSubmit}
              onReset={handleClear}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="avatar" className="mb-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={previewUrl} alt="Profile picture" />
                      <AvatarFallback>
                        {userData.name[0]} {userData.name[1]}
                      </AvatarFallback>
                    </Avatar>
                  </Label>

                  <div className="flex flex-col">
                    <Label htmlFor="avatar" className="mb-2">
                      Profile Picture
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full"
                      disabled={
                        uploadImageMutation.isPending ||
                        updateUserMutation.isPending
                      }
                    />

                    {uploadImageMutation.isPending && (
                      <div className="flex items-center space-x-2 mt-1.5">
                        <Spinner />
                        <p className="text-xs text-gray-500">
                          Uploading profile picture...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                    {!userData.emailVerified ? (
                      <div className="flex items-center space-x-1 text-xs text-red-11">
                        <X className="w-4 h-4" />
                        <p>Email not verified</p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs text-green-11">
                        <Check className="w-4 h-4" />
                        <p>Email verified</p>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    defaultValue={userData.email}
                    disabled
                  />

                  {!userData.emailVerified && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVerifyEmail}
                    >
                      <Mail className="w-4 h-4" />
                      Verify email
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={userData.name}
                    placeholder="Jon Snow"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="reset" variant="outline">
                  Clear
                </Button>
                <Button
                  disabled={
                    uploadImageMutation.isPending ||
                    updateUserMutation.isPending
                  }
                  type="submit"
                >
                  {updateUserMutation.isPending && <Spinner />}
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
        <MobileSidebarTrigger />
      </div>
    </SidebarProvider>
  );
}

function MobileSidebarTrigger() {
  const {isMobile} = useSidebar();

  if (!isMobile) return null;
  return (
    <WrappedTooltip>
      <SidebarTrigger className="absolute top-0 left-0 p-5" />
      <span>Toggle sidebar (⌘+B)</span>
    </WrappedTooltip>
  );
}
