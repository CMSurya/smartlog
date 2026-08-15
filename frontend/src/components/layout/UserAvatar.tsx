import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const user = useAuthStore((s) => s.user);
  const profile = useSettingsStore((s) => s.profile);
  const name = profile.displayName || user?.email?.split("@")[0];

  return (
    <Avatar className={cn(sizes[size], className)}>
      {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={name ?? "User"} />}
      <AvatarFallback>{getInitials(name, user?.email)}</AvatarFallback>
    </Avatar>
  );
}
