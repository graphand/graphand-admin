import {
  FieldTypes,
  Model,
  modelDecorator,
  ModelDefinition,
} from "@graphand/core";

class Terms extends Model {
  static slug = "terms" as const;
  static loadDatamodel = false as const;
  static definition = {
    fields: {
      introduction: { type: FieldTypes.TEXT },
      service: { type: FieldTypes.TEXT }, // Terms of Service and Acceptable Use Policy
      privacy: { type: FieldTypes.TEXT }, // Privacy and Data Protection (Privacy Notice, Cookie Notice, Data Processing Addendum for Customers, Privacy FAQ, etc)
      security: { type: FieldTypes.TEXT }, // Security and Compliance
      payment: { type: FieldTypes.TEXT }, // Payment, Subscriptions, and Service Level Agreement (terms for payment and subscriptions with the service level agreement)
      legal: { type: FieldTypes.TEXT }, // Legal and Additional Policies
    },
  } satisfies ModelDefinition;
}

export default modelDecorator()(Terms);
