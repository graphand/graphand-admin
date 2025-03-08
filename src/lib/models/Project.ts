import {
  FieldTypes,
  Job,
  Model,
  modelDecorator,
  ModelDefinition,
  ValidatorTypes,
} from "@graphand/core";
import Organization from "./Organization";

class Project extends Model {
  static slug = "projects" as const;
  static loadDatamodel = false as const;
  static definition = {
    keyField: "slug",
    fields: {
      name: { type: FieldTypes.TEXT },
      slug: { type: FieldTypes.TEXT },
      organization: {
        type: FieldTypes.RELATION,
        options: {
          ref: Organization.slug,
        },
      },
      version: {
        type: FieldTypes.TEXT,
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "organization" } },
    ],
  } satisfies ModelDefinition;
}

export default modelDecorator()(Project);
