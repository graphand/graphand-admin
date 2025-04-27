import {
  Account,
  PropertyTypes,
  Model,
  Patterns,
  ValidatorTypes,
  modelDecorator,
  defineModelConf,
} from "@graphand/core";
import Organization from "@/lib/models/Organization";

class OrganizationInvitation extends Model {
  static __name = "OrganizationInvitation";

  static configuration = defineModelConf({
    slug: "organizationInvitations",
    noBulk: true,
    properties: {
      email: {
        type: PropertyTypes.STRING,
      },
      organization: {
        type: PropertyTypes.RELATION,
        ref: Organization.configuration.slug,
      },
      transferOwnership: {
        type: PropertyTypes.BOOLEAN,
      },
      account: {
        type: PropertyTypes.RELATION,
        ref: Account.configuration.slug,
      },
    },
    required: ["email", "organization"],
    validators: [
      {
        type: ValidatorTypes.REGEX,
        property: "email",
        pattern: Patterns.EMAIL,
      },
    ],
  });
}

export default modelDecorator()(OrganizationInvitation);
