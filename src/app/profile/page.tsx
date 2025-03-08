import { getCurrentUser, requireAuth } from "@/lib/auth";
import ProfileContent from "./profile-content";

export default async function ProfilePage() {
  // Server-side authentication check
  await requireAuth();

  // Get the current user
  const user = await getCurrentUser();

  return <ProfileContent user={user} />;
}
