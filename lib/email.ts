import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@yourdomain.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "HWS";

function baseLayout(body: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1C2D35;padding:20px 32px;">
            <span style="color:#ffffff;font-size:18px;font-weight:bold;">${APP_NAME}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#f4f6f8;padding:16px 32px;text-align:center;">
            <span style="color:#9ca3af;font-size:12px;">This is an automated message from ${APP_NAME}. Please do not reply.</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#1C2D35;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">${label}</a>`;
}

// ── Email: new user account created → welcome email with temp password ──────
export async function sendWelcomeEmail(opts: {
  toEmail: string;
  toName: string;
  temporaryPassword: string;
  loginUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Welcome to ${APP_NAME} – Your Account is Ready`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;">Welcome to ${APP_NAME}</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        An account has been created for you. Use the temporary password below to log in, then change it right away from your profile.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Email</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.toEmail}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Temporary Password</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:14px;font-weight:bold;color:#111827;font-family:monospace;">${opts.temporaryPassword}</td></tr>
      </table>
      <p style="color:#4b5563;font-size:13px;line-height:1.6;margin-top:16px;">
        For your security, please change this password as soon as you log in.
      </p>
      ${button("Log In & Change Password", opts.loginUrl)}
    `),
  });
}

// ── Email: new referral submitted → sent to submitting user ──────────────────
export async function sendReferralSubmittedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  serviceType: string;
  viewUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Referral Submitted – ${opts.patientName}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;">Referral Submitted Successfully</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        Your referral for <strong>${opts.patientName}</strong> has been submitted and is now under review.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Service Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.serviceType}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Status</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#f59e0b;">Pending</td></tr>
      </table>
      ${button("View Referral", opts.viewUrl)}
    `),
  });
}

// ── Email: new referral submitted → sent to admin ────────────────────────────
export async function sendReferralSubmittedToAdmin(opts: {
  toEmail: string;
  patientName: string;
  submittedBy: string;
  referralId: number;
  serviceType: string;
  viewUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `New Referral Submitted – #${opts.referralId}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;">New Referral Received</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">A new referral has been submitted and requires your review.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.patientName}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Submitted By</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.submittedBy}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Service Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.serviceType}</td></tr>
      </table>
      ${button("Review Referral", opts.viewUrl)}
    `),
  });
}

// ── Email: result PDF uploaded → sent to the referral's user ────────────────
export async function sendResultUploadedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  viewUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Result Available – Referral #${opts.referralId}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;">Your Result is Ready</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        The result for your referral for <strong>${opts.patientName}</strong> (#${opts.referralId}) has been uploaded and is now available for download.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.patientName}</td></tr>
      </table>
      ${button("View & Download Result", opts.viewUrl)}
    `),
  });
}

// ── Email: status changed → sent to the referral's user ─────────────────────
export async function sendStatusChangedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  newStatus: string;
  viewUrl: string;
}) {
  const statusColor: Record<string, string> = {
    Approved: "#16a34a",
    Rejected: "#dc2626",
    Completed: "#2563eb",
    "In Progress": "#d97706",
    Pending: "#f59e0b",
  };
  const color = statusColor[opts.newStatus] ?? "#6b7280";

  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Referral Status Updated – #${opts.referralId}`,
    html: baseLayout(`
      <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;">Referral Status Updated</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        The status of your referral for <strong>${opts.patientName}</strong> has been updated.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">New Status</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:${color};">${opts.newStatus}</td></tr>
      </table>
      ${button("View Referral", opts.viewUrl)}
    `),
  });
}
