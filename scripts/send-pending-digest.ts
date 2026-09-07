import "dotenv/config";
import { checkAndSendPendingReferralsDigest } from "@/action/pending-digest.action";

async function main() {
  const targetEmail = process.argv[2];
  console.log("⏳ Starting 24h pending referrals digest execution...");
  if (targetEmail) {
    console.log(`Target email override: ${targetEmail}`);
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

