import { Model } from "@graphand/core";

class Project extends Model {
  static slug = "projects" as const;
  static loadDatamodel = false as const;
}

export default Project;
