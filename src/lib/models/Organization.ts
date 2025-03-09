import {
  Account,
  FieldTypes,
  Model,
  modelDecorator,
  ModelDefinition,
  ValidatorTypes,
} from "@graphand/core";
import Terms from "./Terms";

class Organization extends Model {
  static slug = "organizations" as const;
  static loadDatamodel = false as const;
  static definition = {
    keyField: "slug",
    fields: {
      name: { type: FieldTypes.TEXT },
      slug: { type: FieldTypes.TEXT },
      owner: {
        type: FieldTypes.RELATION,
        options: {
          ref: Account.slug,
        },
      },
      _accounts: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.RELATION,
            options: {
              ref: Account.slug,
            },
          },
        },
      },
      _consent: {
        type: FieldTypes.OBJECT,
        options: {
          fields: {
            terms: {
              type: FieldTypes.RELATION,
              options: {
                ref: Terms.slug,
              },
            },
            account: {
              type: FieldTypes.RELATION,
              options: {
                ref: Account.slug,
              },
            },
          },
        },
      },
    },
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "name" } }],
  } satisfies ModelDefinition;
}

export default modelDecorator()(Organization);
