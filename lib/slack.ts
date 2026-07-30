async function postToSlack(blocks: object[], fallbackText: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: fallbackText,
        blocks,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Slack webhook error [${res.status}]:`, errorText);
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

/**
 * Status config map matching your precise status keys and hex colors.
 */
const STATUS_CONFIG: Record<
  string,
  { label: string; emoji: string; colorHex: string }
> = {
  Pending: { label: "Pending", emoji: "🟠", colorHex: "#F59E0B" },
  Clear: { label: "Clear", emoji: "🟢", colorHex: "#10B981" },
  Lab: { label: "Lab", emoji: "🟣", colorHex: "#8B5CF6" },
  NoShow: { label: "No Show", emoji: "🔴", colorHex: "#EF4444" },
  Confirmed: { label: "Confirmed", emoji: "🔵", colorHex: "#3B82F6" },
  Refusal: { label: "Refusal", emoji: "🌹", colorHex: "#E11D48" },
  inProgress: { label: "In Progress", emoji: "🔷", colorHex: "#06B6D4" },
  Ready: { label: "Ready", emoji: "❇️", colorHex: "#059669" },
};

/**
 * Maps incoming status string/code to formatted Slack markdown with status badges.
 */
function formatStatusBadge(statusKey?: string | number): string {
  if (!statusKey) return "🟠 *Pending*";

  const key = String(statusKey).trim();
  
  // Case-insensitive fallback lookup
  const matchedKey = Object.keys(STATUS_CONFIG).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  );

  const config = matchedKey
    ? STATUS_CONFIG[matchedKey]
    : { label: key, emoji: "🔹", colorHex: "#6B7280" };

  return `${config.emoji} *${config.label}*`;
}

export async function notifySlackNewReferral(opts: {
  referralId: number;
  patientName: string;
  submittedBy: string;
  serviceType: string;
  companyName: string;
  status?: string;
}) {
  const company = opts.companyName?.trim() || "N/A";
  const title = `📥 New Referral Submitted — #${opts.referralId}`;
  const statusBadge = formatStatusBadge(opts.status ?? "Pending");

  await postToSlack(
    [
      {
        type: "header",
        text: { type: "plain_text", text: title, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Patient:*\n${opts.patientName}` },
          { type: "mrkdwn", text: `*Submitted By:*\n${opts.submittedBy}` },
          { type: "mrkdwn", text: `*Company:*\n${company}` },
          { type: "mrkdwn", text: `*Service Type:*\n${opts.serviceType}` },
          { type: "mrkdwn", text: `*Status:*\n${statusBadge}` },
        ],
      },
    ],
    title
  );
}

export async function notifySlackStatusChanged(opts: {
  referralId: number;
  patientName: string;
  newStatus: string;
  companyName: string;
}) {
  const company = opts.companyName?.trim() || "N/A";
  const title = `🔄 Referral Status Updated — #${opts.referralId}`;
  const statusBadge = formatStatusBadge(opts.newStatus);

  await postToSlack(
    [
      {
        type: "header",
        text: { type: "plain_text", text: title, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Patient:*\n${opts.patientName}` },
          { type: "mrkdwn", text: `*Company:*\n${company}` },
          { type: "mrkdwn", text: `*New Status:*\n${statusBadge}` },
        ],
      },
    ],
    title
  );
}

export async function notifySlackResultUploaded(opts: {
  referralId: number;
  patientName: string;
  companyName: string;
  status?: string;
}) {
  const company = opts.companyName?.trim() || "N/A";
  const title = `📄 Referral Result Uploaded — #${opts.referralId}`;
  const statusBadge = formatStatusBadge(opts.status ?? "Ready");

  await postToSlack(
    [
      {
        type: "header",
        text: { type: "plain_text", text: title, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Patient:*\n${opts.patientName}` },
          { type: "mrkdwn", text: `*Company:*\n${company}` },
          { type: "mrkdwn", text: `*Status:*\n${statusBadge}` },
        ],
      },
    ],
    title
  );
}

export async function notifySlackNewUser(opts: {
  name: string;
  email: string;
  role: string;
  companyName: string;
}) {
  const company = opts.companyName?.trim() || "N/A";
  const title = `👤 New User Created`;

  await postToSlack(
    [
      {
        type: "header",
        text: { type: "plain_text", text: title, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${opts.name}` },
          { type: "mrkdwn", text: `*Email:*\n${opts.email}` },
          { type: "mrkdwn", text: `*Role:*\n\`${opts.role}\`` },
          { type: "mrkdwn", text: `*Company:*\n${company}` },
        ],
      },
    ],
    title
  );
}