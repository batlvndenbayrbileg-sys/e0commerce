import { Resend } from "resend";

/**
 * Transactional email via Resend. No RESEND_API_KEY → mock (logs instead of sends),
 * so the order flow never breaks in dev/demo.
 */
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "VEXO <onboarding@resend.dev>";
const resend = KEY ? new Resend(KEY) : null;
export const EMAIL_LIVE = !!resend;

const mnt = (n: number) => `₮${Math.round(n).toLocaleString("en-US")}`;

export type OrderEmail = {
  id: string;
  email: string;
  total: number;
  estimatedDelivery: string;
  items: { title: string; quantity: number; amount: number }[];
};

export async function sendOrderConfirmation(o: OrderEmail) {
  const rows = o.items.map(i =>
    `<tr>
       <td style="padding:8px 0;color:#1C1E16;font-size:14px">${i.title} <span style="color:#9CA095">× ${i.quantity}</span></td>
       <td style="padding:8px 0;text-align:right;color:#1C1E16;font-size:14px;font-weight:600">${mnt(i.amount)}</td>
     </tr>`).join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F1F1EB;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee">
      <div style="background:#0E0F10;padding:24px 28px">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:1px">VEXO</span>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 6px;font-size:22px;color:#0E0F10">Order confirmed 🎉</h1>
        <p style="margin:0 0 20px;color:#5C5F63;font-size:14px;line-height:1.6">
          Thanks for your order. We've started packing — you'll get tracking within 24 hours.
        </p>
        <table style="width:100%;border-collapse:collapse;background:#F7F8F2;border-radius:10px;padding:8px">
          <tr><td style="padding:10px 14px;color:#9CA095;font-size:13px">Order number</td>
              <td style="padding:10px 14px;text-align:right;font-weight:700;color:#0E0F10">${o.id}</td></tr>
          <tr><td style="padding:10px 14px;color:#9CA095;font-size:13px">Estimated delivery</td>
              <td style="padding:10px 14px;text-align:right;color:#0E0F10">${o.estimatedDelivery}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:18px">${rows}
          <tr><td style="border-top:1px solid #eee;padding:14px 0 0;font-weight:700;color:#0E0F10">Total</td>
              <td style="border-top:1px solid #eee;padding:14px 0 0;text-align:right;font-weight:800;color:#FF6A1A;font-size:18px">${mnt(o.total)}</td></tr>
        </table>
        <p style="margin:24px 0 0;color:#9CA095;font-size:12px">VEXO · Performance workout wear · Ulaanbaatar, Mongolia</p>
      </div>
    </div>
  </div>`;

  if (!resend) {
    console.log(`[email mock] order ${o.id} → ${o.email} (set RESEND_API_KEY to send for real)`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to: o.email, subject: `Your VEXO order ${o.id} is confirmed`, html });
    console.log(`[email] sent order ${o.id} → ${o.email}`);
  } catch (e: any) {
    console.error("email send failed:", e.message);
  }
}
