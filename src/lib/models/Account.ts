import {
  FieldTypes,
  modelDecorator,
  ModelDefinition,
  Account as CoreAccount,
  ModelInstance,
} from "@graphand/core";

class Account extends CoreAccount {
  static slug = "accounts" as const;
  static definition = {
    ...CoreAccount.definition,
    fields: {
      ...CoreAccount.definition.fields,
      firstname: { type: FieldTypes.TEXT },
      lastname: { type: FieldTypes.TEXT },
    },
  } satisfies ModelDefinition;

  getFullname(this: ModelInstance<typeof Account>) {
    return `${this.firstname} ${this.lastname}`;
  }

  getInitials(this: ModelInstance<typeof Account>) {
    return `${this.firstname?.[0] || ""}${
      this.lastname?.[0] || ""
    }`.toUpperCase();
  }
}

export default modelDecorator()(Account);
