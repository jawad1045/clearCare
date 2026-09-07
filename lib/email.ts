import { Resend } from "resend";
import { formatDateTime } from "@/lib/format-date";

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

export type PendingReferralDigestItem = {
  id: number;
  type: "Medical" | "Behavioral Health";
  patientName: string;
  companyName: string;
  referName: string;
  dateOfReferral: Date;
  serviceTypeOrReferralType: string;
};

export async function sendPendingReferralsDigestEmail(opts: {
  toEmail: string;
  medicalCount: number;
  bhCount: number;
  totalPending: number;
  items: PendingReferralDigestItem[];
}) {
  const formattedDate = formatDateTime(new Date());

  const rows = opts.items
    .slice(0, 50)
    .map(
      (item, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f9fafb"};">
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;font-weight:bold;color:#111827;">#${item.id}</td>
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;">
          <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;background:${
            item.type === "Medical" ? "#dbeafe;color:#1e40af" : "#f3e8ff;color:#6b21a8"
          };">
            ${item.type}
          </span>
        </td>
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;color:#111827;">${item.patientName}</td>
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;color:#4b5563;">${item.companyName}</td>
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;color:#4b5563;">${item.referName}</td>
        <td style="padding:10px 8px;border:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${item.dateOfReferral ? formatDateTime(item.dateOfReferral) : "—"}</td>
      </tr>`
    )
    .join("");

  const moreNotice =
    opts.items.length > 50
      ? `<p style="font-size:12px;color:#6b7280;margin-top:8px;">Showing 50 of ${opts.items.length} pending referrals. Log in to the portal to view all.</p>`
      : "";

  return await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `Daily Pending Referrals Summary: ${opts.totalPending} Pending (${opts.medicalCount} Medical, ${opts.bhCount} BH)`,
    html: baseLayout(
      "Daily Pending Referrals Summary",
      `
      <p style="color:#4b5563;font-size:14px;line-height:1.6;margin-top:0;">
        This is your automated 24-hour summary of remaining pending referrals awaiting review as of <strong>${formattedDate}</strong>.
      </p>

      <!-- Summary Stat Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
        <tr>
          <td width="32%" style="padding:12px;background:#fef3c7;border-radius:6px;border:1px solid #fde68a;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#92400e;">${opts.totalPending}</div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#b45309;margin-top:2px;">Total Pending</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:12px;background:#dbeafe;border-radius:6px;border:1px solid #bfdbfe;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#1e40af;">${opts.medicalCount}</div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#1d4ed8;margin-top:2px;">Medical</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:12px;background:#f3e8ff;border-radius:6px;border:1px solid #e9d5ff;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#6b21a8;">${opts.bhCount}</div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#7e22ce;margin-top:2px;">Behavioral Health</div>
          </td>
        </tr>
      </table>

      ${
        opts.totalPending === 0
          ? `<p style="color:#16a34a;font-size:14px;font-weight:600;padding:16px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;">
              All caught up! There are currently no pending referrals remaining.
             </p>`
          : `
          <div style="margin-top:24px;">
            <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:8px;">
              Pending Referrals Awaiting Review (${opts.totalPending})
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#1C2D35;color:#ffffff;">
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">ID</th>
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">Type</th>
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">Patient</th>
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">Company</th>
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">Referrer</th>
                  <th style="padding:8px;font-size:11px;text-align:left;border:1px solid #1C2D35;">Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            ${moreNotice}
          </div>
          `
      }
    `
    ),
  });
}