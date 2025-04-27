import {
  Model,
  modelDecorator,
  PropertyTypes,
  defineModelConf,
} from "@graphand/core";

class Terms extends Model {
  static __name = "Terms";
  static isSystem = true;

  static configuration = defineModelConf({
    slug: "terms",
    properties: {
      introduction: { type: PropertyTypes.STRING },
      service: { type: PropertyTypes.STRING }, // Terms of Service and Acceptable Use Policy
      privacy: { type: PropertyTypes.STRING }, // Privacy and Data Protection (Privacy Notice, Cookie Notice, Data Processing Addendum for Customers, Privacy FAQ, etc)
      security: { type: PropertyTypes.STRING }, // Security and Compliance
      payment: { type: PropertyTypes.STRING }, // Payment, Subscriptions, and Service Level Agreement (terms for payment and subscriptions with the service level agreement)
      legal: { type: PropertyTypes.STRING }, // Legal and Additional Policies
    },
  });
}

export default modelDecorator()(Terms);
