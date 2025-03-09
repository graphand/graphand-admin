import {
  Account,
  FieldTypes,
  Model,
  ModelDefinition,
  modelDecorator,
} from "@graphand/core";
import Organization from "@/lib/models/Organization";

class OrganizationInvitation extends Model {
  static slug = "organizationInvitations" as const;
  static loadDatamodel = false as const;
  static definition = {
    fields: {
      email: {
        type: FieldTypes.TEXT,
      },
      organization: {
        type: FieldTypes.RELATION,
        options: {
          ref: Organization.slug,
        },
      },
      transferOwnership: {
        type: FieldTypes.BOOLEAN,
      },
      account: {
        type: FieldTypes.RELATION,
        options: {
          ref: Account.slug,
        },
      },
    },
  } satisfies ModelDefinition;
}

export default modelDecorator()(OrganizationInvitation);
