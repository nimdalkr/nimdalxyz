export const supportedWriterEmails = [
  "trialhero41@gmail.com",
  "0xnimdal@gmail.com"
] as const;

const supportedWriterEmailSet = new Set<string>(supportedWriterEmails);

function normalizedEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function configuredWriterEmails(value: string | undefined) {
  if (!value?.trim()) {
    return new Set<string>();
  }

  return new Set(
    value
      .split(",")
      .map(normalizedEmail)
      .filter((email) => supportedWriterEmailSet.has(email))
  );
}

export function isConfiguredWriterEmail(value: unknown, configuration: string | undefined) {
  const email = normalizedEmail(value);
  return email.length > 0 && configuredWriterEmails(configuration).has(email);
}

export function isVerifiedConfiguredWriter(
  profile: { email: unknown; emailVerified: unknown },
  configuration: string | undefined
) {
  return (
    profile.emailVerified === true &&
    isConfiguredWriterEmail(profile.email, configuration)
  );
}
