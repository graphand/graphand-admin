import { getCurrentUser, requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function EditProfilePage() {
  // Server-side authentication check
  await requireAuth();

  // Get the current user
  const user = await getCurrentUser();

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <Button asChild variant="outline">
          <Link href="/profile">Back to Profile</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Profile editing functionality will be implemented in a future
              update. Currently, profile updates must be performed through the
              Graphand platform directly.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">Your current profile:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Email
                </h3>
                <p className="text-base">
                  {user?._email || "No email provided"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  User ID
                </h3>
                <p className="font-mono text-xs">{user?._id || "Unknown"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button asChild variant="outline">
          <Link href="/profile">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
