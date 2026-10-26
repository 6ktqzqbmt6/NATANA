export function isAllowedEmail(email: unknown, raw = process.env.ALLOWED_EMAILS): email is string {
  if (typeof email !== "string" || !email.trim()) return false;
  const allowed = (raw ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function isVerifiedGoogleProfile(profile: unknown): profile is { email: string; email_verified: true } {
  return typeof profile === "object" && profile !== null &&
    "email_verified" in profile && profile.email_verified === true &&
    "email" in profile && typeof profile.email === "string";
}
