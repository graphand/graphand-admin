import {
  Model,
  modelDecorator,
  PropertyTypes,
  Account,
  defineModelConf,
} from "@graphand/core";
import Terms from "@/lib/models/Terms";

class Organization extends Model {
  static __name = "Organization";
  static isSystem = true;

  static configuration = defineModelConf({
    slug: "organizations",
    keyProperty: "slug",
    noBulk: true,
    properties: {
      name: { type: PropertyTypes.STRING },
      slug: { type: PropertyTypes.STRING },
      owner: {
        type: PropertyTypes.RELATION,
        ref: Account.configuration.slug,
      },
      _accounts: {
        type: PropertyTypes.ARRAY,
        items: {
          type: PropertyTypes.RELATION,
          ref: Account.configuration.slug,
        },
      },
      _consent: {
        type: PropertyTypes.OBJECT,
        properties: {
          terms: {
            type: PropertyTypes.RELATION,
            ref: Terms.configuration.slug,
          },
          account: {
            type: PropertyTypes.RELATION,
            ref: Account.configuration.slug,
          },
        },
      },
    },
    required: ["name"],
  });
}

export default modelDecorator()(Organization);
