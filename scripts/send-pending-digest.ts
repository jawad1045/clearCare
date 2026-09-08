import "dotenv/config";
import { checkAndSendPendingReferralsDigest } from "@/action/pending-digest.action";

async function main() {
  const rawArgs = process.argv.slice(2);
  const targetEmail = rawArgs.length > 0 ? rawArgs.join(", ") : undefined;
  console.log("⏳ Starting 24h pending referrals digest execution...");
  if (targetEmail) {
    console.log(`Target email(s): ${targetEmail}`);
  }

  const result = await checkAndSendPendingReferralsDigest(targetEmail);
  console.log("✅ Digest sent successfully!");
  console.log({
    sentTo: result.sentTo,
    totalPending: result.totalPending,
    medicalCount: result.medicalCount,
    bhCount: result.bhCount,
    timestamp: result.timestamp,
  });
}

main().catch((err) => {
  console.error("❌ Failed to send pending referrals digest:", err);
  process.exit(1);
});

