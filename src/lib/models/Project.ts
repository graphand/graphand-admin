import {
  Model,
  modelDecorator,
  PropertyTypes,
  Job,
  defineModelConf,
} from "@graphand/core";
import Organization from "@/lib/models/Organization";

class Project extends Model {
  static __name = "Project";
  static isSystem = true;

  static configuration = defineModelConf({
    slug: "projects",
    keyProperty: "slug",
    noBulk: true,
    loadDatamodel: false,
    properties: {
      name: { type: PropertyTypes.STRING },
      slug: { type: PropertyTypes.STRING },
      organization: {
        type: PropertyTypes.RELATION,
        ref: Organization.configuration.slug,
      },
      version: {
        type: PropertyTypes.STRING,
      },
      _job: {
        type: PropertyTypes.RELATION,
        ref: Job.configuration.slug,
      },
    },
    required: ["name", "organization"],
  });
}

export default modelDecorator()(Project);
