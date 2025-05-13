import { getCookieProject } from "@/lib/server";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const project = await getCookieProject();

  if (!project) {
    return null;
  }

  return children;
}
