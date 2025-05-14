import { Controller } from "@graphand/core";

export const controllerSubscriptionsUpgrade: Controller<{
  data: {
    plan?: string;
    priceId?: string;
  };
}> = {
  path: "/projects/:id/subscriptions/upgrade",
  methods: ["post"],
  secured: true,
};

export const controllerSubscriptionsCurrent: Controller = {
  path: "/projects/:id/subscriptions/current",
  methods: ["get"],
  secured: true,
};

export const controllerSubscriptionsPortal: Controller = {
  path: "/projects/:id/subscriptions/portal",
  methods: ["get"],
  secured: true,
};
