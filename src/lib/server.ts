import { cookies } from "next/headers";

export const getCookieProject = async () => {
  const cookieStore = await cookies();
  const project = cookieStore.get("NEXT_GRAPHAND_PROJECT");
  return project?.value;
};
