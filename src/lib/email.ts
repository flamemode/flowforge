import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Origo <noreply@origo.dev>";

export async function sendPurchaseConfirmation({
  to,
  name,
  packName,
  credits,
  amountPaid,
}: {
  to: string;
  name: string | null;
  packName: string;
  credits: number;
  amountPaid: number;
}) {
  const resend = getResend();
  if (!resend) return;

  const formattedAmount = `$${(amountPaid / 100).toFixed(2)}`;
  const greeting = name ? `Hi ${name}` : "Hi";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Origo ${packName} — ${credits} credit${credits > 1 ? "s" : ""} added`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #09090b; margin-bottom: 24px;">
          Payment confirmed
        </h1>
        <p style="color: #3f3f46; line-height: 1.6; margin-bottom: 16px;">
          ${greeting},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
          Your <strong>${packName}</strong> purchase is complete. We&rsquo;ve added
          <strong>${credits} credit${credits > 1 ? "s" : ""}</strong> to your account.
        </p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #71717a; padding: 4px 0;">Pack</td>
              <td style="text-align: right; font-weight: 600; color: #09090b;">${packName}</td>
            </tr>
            <tr>
              <td style="color: #71717a; padding: 4px 0;">Credits</td>
              <td style="text-align: right; font-weight: 600; color: #09090b;">${credits}</td>
            </tr>
            <tr>
              <td style="color: #71717a; padding: 4px 0;">Amount</td>
              <td style="text-align: right; font-weight: 600; color: #09090b;">${formattedAmount}</td>
            </tr>
          </table>
        </div>
        <p style="color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
          Head to your <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://origo.dev"}/dashboard" style="color: #7c3aed;">dashboard</a>
          to start generating projects.
        </p>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 40px;">
          Origo by Sandnes Productions
        </p>
      </div>
    `,
  });
}

export async function sendGenerationComplete({
  to,
  name,
  projectName,
  projectId,
}: {
  to: string;
  name: string | null;
  projectName: string;
  projectId: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const greeting = name ? `Hi ${name}` : "Hi";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://origo.dev";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your project "${projectName}" is ready to download`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #09090b; margin-bottom: 24px;">
          Your project is ready
        </h1>
        <p style="color: #3f3f46; line-height: 1.6; margin-bottom: 16px;">
          ${greeting},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
          <strong>${projectName}</strong> has been generated and is ready to download.
        </p>
        <a href="${appUrl}/project/${projectId}"
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View &amp; Download
        </a>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 40px;">
          Origo by Sandnes Productions
        </p>
      </div>
    `,
  });
}
