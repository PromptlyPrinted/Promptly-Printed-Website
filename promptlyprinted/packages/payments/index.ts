import "server-only";
import { env } from "@repo/env";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});
//TODO: update to   apiVersion: "2024-12-20.acacia",

export type { Stripe } from "stripe";
