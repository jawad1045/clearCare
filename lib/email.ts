import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "admin@healthworkspros.net";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "HWP Clear-Care® Portal";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://clearcarenj.com";
const LOGO_URL = `${APP_URL}/logo.png`;

function baseLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#1C2D35;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="90" valign="middle">
                    <img
                      src="${LOGO_URL}"
                      alt="${APP_NAME}"
                      width="70"
                      style="display:block;border:0;"
                    />
                  </td>

                  <td valign="middle" style="padding-left:16px;">
                    <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">
                      ${APP_NAME}
                    </div>

                    <div style="margin-top:6px;color:#ffffff;font-size:16px;font-weight:600;">
                      ${title}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>

          <tr>
            <td style="background:#f4f6f8;padding:16px 32px;text-align:center;">
              <span style="color:#9ca3af;font-size:12px;">
                This is an automated message from ${APP_NAME}. Please do not reply.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#1C2D35;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">${label}</a>`;
}

function companyRow(companyName?: string) {
  if (!companyName) return "";
  return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Company</td>
      <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${companyName}</td></tr>`;
}

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
    html: baseLayout(
      "Welcome to Your Account",
      `
        <h2 style="margin:0 0 8px;color:#1C2D35;font-size:20px;font-weight:bold;">
          Welcome to ${APP_NAME}
        </h2>

        <p style="color:#4b5563;font-size:14px;line-height:1.6;">
          Hi ${opts.toName},
        </p>

        <p style="color:#4b5563;font-size:14px;line-height:1.6;">
          An account has been created for you. Use the temporary password below to log in, then change it immediately from your profile after signing in.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">
              Email
            </td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">
              ${opts.toEmail}
            </td>
          </tr>

          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">
              Temporary Password
            </td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:14px;font-weight:bold;color:#111827;font-family:monospace;">
              ${opts.temporaryPassword}
            </td>
          </tr>
        </table>

        <p style="color:#4b5563;font-size:13px;line-height:1.6;margin-top:16px;">
          For your security, please change your temporary password immediately after your first login.
        </p>

        ${button("Log In & Change Password", opts.loginUrl)}
      `
    ),
  });
}

export async function sendPasswordResetEmail(opts: {
  toEmail: string;
  toName: string;
  temporaryPassword: string;
  loginUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Your ${APP_NAME} Password Has Been Reset`,
    html: baseLayout(
      "Password Reset Notification",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        An administrator has reset your password. Use the temporary password below to log in, then change it right away from your profile.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Email</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.toEmail}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Temporary Password</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:14px;font-weight:bold;color:#111827;font-family:monospace;">${opts.temporaryPassword}</td></tr>
      </table>
      <p style="color:#4b5563;font-size:13px;line-height:1.6;margin-top:16px;">
        If you didn't request this, contact your administrator immediately.
      </p>
      ${button("Log In & Change Password", opts.loginUrl)}
    `),
  });
}

export async function sendReferralSubmittedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  serviceType: string;
  companyName?: string;
  submittedBy?: string;
  status?: string;
  dateSubmitted?: string;
  submittedAt?: string;
}) {
  const formattedDate = opts.dateSubmitted ?? opts.submittedAt;

  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Referral Submitted – ${opts.patientName}`,
    html: baseLayout(
      "Referral Submitted Successfully",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        Your referral for <strong>${opts.patientName}</strong> has been submitted and is now under review.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        ${companyRow(opts.companyName)}
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Service Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.serviceType}</td></tr>
        ${
          formattedDate
            ? `<tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Date Submitted</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${formattedDate}</td></tr>`
            : ""
        }
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Status</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#f59e0b;">${opts.status ?? "Pending"}</td></tr>
      </table>
    `),
  });
}

export async function sendReferralSubmittedToAdmin(opts: {
  toEmail: string;
  patientName: string;
  submittedBy: string;
  referralId: number;
  serviceType: string;
  companyName?: string;
  status?: string;
  dateSubmitted?: string;
  submittedAt?: string;
}) {
  const formattedDate = opts.dateSubmitted ?? opts.submittedAt;

  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `New Referral Submitted – #${opts.referralId}`,
    html: baseLayout(
      "New Referral Received",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">A new referral has been submitted and requires your review.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.patientName}</td></tr>
        ${companyRow(opts.companyName)}
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Submitted By</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.submittedBy}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Service Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.serviceType}</td></tr>
        ${
          formattedDate
            ? `<tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Date & Time</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${formattedDate}</td></tr>`
            : ""
        }
      </table>
    `),
  });
}

export async function sendResultUploadedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  companyName?: string;
  uploadedAt?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Result Available – Referral #${opts.referralId}`,
    html: baseLayout(
      "Your Result is Ready",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        The result for your referral for <strong>${opts.patientName}</strong> (#${opts.referralId}) has been uploaded and is now available for download.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.patientName}</td></tr>
        ${companyRow(opts.companyName)}
        ${
          opts.uploadedAt
            ? `<tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Uploaded At</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${opts.uploadedAt}</td></tr>`
            : ""
        }
      </table>
    `),
  });
}

export async function sendStatusChangedToUser(opts: {
  toEmail: string;
  toName: string;
  patientName: string;
  referralId: number;
  newStatus: string;
  companyName?: string;
  previousStatus?: string;
  updatedDate?: string;
  updatedAt?: string;
}) {
  const statusColor: Record<string, string> = {
    Approved: "#16a34a",
    Rejected: "#dc2626",
    Completed: "#2563eb",
    "In Progress": "#d97706",
    Pending: "#f59e0b",
  };
  const color = statusColor[opts.newStatus] ?? "#6b7280";
  const formattedDate = opts.updatedDate ?? opts.updatedAt;

  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Referral Status Updated – #${opts.referralId}`,
    html: baseLayout(
      "Referral Status Updated",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">Hi ${opts.toName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        The status of your referral for <strong>${opts.patientName}</strong> has been updated.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Referral ID</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">#${opts.referralId}</td></tr>
        ${companyRow(opts.companyName)}
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">New Status</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:${color};">${opts.newStatus}</td></tr>
        ${
          formattedDate
            ? `<tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Updated At</td>
            <td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;font-weight:bold;color:#111827;">${formattedDate}</td></tr>`
            : ""
        }
      </table>
    `),
  });
}