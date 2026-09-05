import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendPasswordResetEmail } from "../lib/email";

// Fires when a password reset is requested (POST /auth/customer/emailpass/reset-password).
// Medusa generates a short-lived JWT and emits this event; we turn it into a
// storefront reset link and email it. Only customer resets are handled here —
// admin/user resets are managed inside the Medusa admin itself.
//
// Storefront confirms the reset by POSTing the token +new password to
// /auth/customer/emailpass/update (see web/lib/medusa.ts resetConfirm).
export default async function passwordResetHandler({
  event: { data },
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  if (data.actor_type && data.actor_type !== "customer") return;

  const email = data.entity_id;
  const base = (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/mn/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail({ email, url });
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
