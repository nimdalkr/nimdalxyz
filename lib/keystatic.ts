import "server-only";

const githubEnvironment = [
  "KEYSTATIC_GITHUB_CLIENT_ID",
  "KEYSTATIC_GITHUB_CLIENT_SECRET",
  "KEYSTATIC_SECRET",
  "NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG"
] as const;

export const isKeystaticGitHubConfigured = githubEnvironment.every(
  (name) => Boolean(process.env[name]?.trim())
);

export const isKeystaticAdminEnabled =
  process.env.NODE_ENV !== "production" || isKeystaticGitHubConfigured;
