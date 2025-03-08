import { getCurrentUser, requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components";

export default async function DashboardPage() {
  // Server-side authentication check
  await requireAuth();

  // Get the current user
  const user = await getCurrentUser();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Welcome to your Dashboard!
        </h2>
        <p className="text-muted-foreground mb-6">
          You are now logged in to your Graphand account.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/profile">View Profile</Link>
          </Button>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
