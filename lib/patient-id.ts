export function generatePatientId(ssn: string): string {
  const clean = ssn.replace(/\D/g, "");
  if (!clean) return "UNKNOWN";
  
  const last4 = clean.slice(-4).padStart(4, "0");
  return `PT-${last4}`;
}
