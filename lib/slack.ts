const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function postToSlack(text: string) {
  if (!SLACK_WEBHOOK_URL) return;

  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {});
}

export async function notifySlackNewReferral(opts: {
  referralId: number;
  patientName: string;
  submittedBy: string;
  serviceType: string;
  viewUrl: string;
}) {
  await postToSlack(
    `:inbox_tray: *New referral submitted* — #${opts.referralId}\n` +
      `Patient: *${opts.patientName}*\n` +
      `Submitted by: ${opts.submittedBy}\n` +
      `Service type: ${opts.serviceType}\n` +
      `<${opts.viewUrl}|View referral>`
  );
}

export async function notifySlackStatusChanged(opts: {
  referralId: number;
  patientName: string;
  newStatus: string;
  viewUrl: string;
}) {
  await postToSlack(
    `:arrows_counterclockwise: *Referral status updated* — #${opts.referralId}\n` +
      `Patient: *${opts.patientName}*\n` +
      `New status: *${opts.newStatus}*\n` +
      `<${opts.viewUrl}|View referral>`
  );
}

export async function notifySlackResultUploaded(opts: {
  referralId: number;
  patientName: string;
  viewUrl: string;
}) {
  await postToSlack(
    `:page_facing_up: *Result uploaded* — #${opts.referralId}\n` +
      `Patient: *${opts.patientName}*\n` +
      `<${opts.viewUrl}|View referral>`
  );
}

export async function notifySlackNewUser(opts: {
  name: string;
  email: string;
  role: string;
  organization: string;
}) {
  await postToSlack(
    `:bust_in_silhouette: *New user created*\n` +
      `Name: *${opts.name}*\n` +
      `Email: ${opts.email}\n` +
      `Role: ${opts.role}\n` +
      `Organization: ${opts.organization}`
  );
}
