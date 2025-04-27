import { useQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import Project from "@/lib/models/Project";

export function useProject(id: string) {
  return useQuery({
    queryKey: [Project.slug, id],
    queryFn: () => client.model(Project).get(id),
  });
}
