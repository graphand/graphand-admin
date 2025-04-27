import {
  modelDecorator,
  Account as CoreAccount,
  ModelInstance,
  defineModelConf,
  PropertyTypes,
} from "@graphand/core";

class Account extends CoreAccount {
  static configuration = defineModelConf({
    ...CoreAccount.configuration,
    properties: {
      ...CoreAccount.configuration.properties,
      firstname: { type: PropertyTypes.STRING },
      lastname: { type: PropertyTypes.STRING },
    },
  });

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
