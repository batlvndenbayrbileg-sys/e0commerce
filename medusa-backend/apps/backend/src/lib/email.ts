// Transactional email from the Medusa backend via Resend's REST API (no extra
// dep). No RESEND_API_KEY → mock (logs), so fulfillment never breaks in dev.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "NARAN <onboarding@resend.dev>";

export type ShippedEmail = {
  id: string;
  email: string;
  items: { title: string; quantity: number }[];
};

export function renderShippedEmail(o: ShippedEmail): string {
  const rows = o.items.map(i =>
    `<tr><td style="padding:7px 0;color:#1B1533;font-size:14px">${i.title} <span style="color:#8B85A0">× ${i.quantity}</span></td></tr>`
  ).join("");
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F4F2FB;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #ECE9F7">
      <div style="background:linear-gradient(120deg,#6E54EC,#A95EEA);padding:26px 28px">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:2px">NARAN</span>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 6px;font-size:22px;color:#1B1533">Захиалга хүргэлтэд гарлаа 🚚</h1>
        <p style="margin:0 0 20px;color:#5C5670;font-size:14px;line-height:1.7">
          Таны <b>${o.id}</b> захиалга замдаа гарлаа. Удахгүй хүлээж авах болно.
        </p>
        <table style="width:100%;border-collapse:collapse;background:#F7F5FD;border-radius:12px;padding:4px 14px">${rows}</table>
        <p style="margin:24px 0 0;color:#8B85A0;font-size:12px">NARAN · Гоо сайхан, нэг дороос · Улаанбаатар, Монгол</p>
      </div>
    </div>
  </div>`;
}

export async function sendShippedEmail(o: ShippedEmail): Promise<void> {
  const html = renderShippedEmail(o);
  if (!KEY) {
    console.log(`[email mock] shipped ${o.id} → ${o.email} (RESEND_API_KEY тохируулбал бодитоор илгээнэ)`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to: o.email, subject: `NARAN захиалга ${o.id} хүргэлтэд гарлаа`, html }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    console.log(`[email] shipped ${o.id} → ${o.email}`);
  } catch (e: any) {
    console.error("shipped email failed:", e.message);
  }
}
