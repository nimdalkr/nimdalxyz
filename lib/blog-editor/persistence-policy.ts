export type BlogEditorPersistenceMode =
  | "local"
  | "github"
  | "missing-production-configuration"
  | "partial-production-configuration";

export type BlogEditorDeploymentHeadResolution =
  | { status: "ready"; oid: string }
  | { status: "missing-production-sha" }
  | { status: "non-production" };

type BlogEditorPersistenceEnvironment = {
  nodeEnv?: string;
  appId?: string;
  privateKey?: string;
  installationId?: string;
};

export function resolveBlogEditorPersistenceMode(
  environment: BlogEditorPersistenceEnvironment
): BlogEditorPersistenceMode {
  if (environment.nodeEnv !== "production") {
    return "local";
  }

  const configuredCount = [
    environment.appId,
    environment.privateKey,
    environment.installationId
  ].filter((value) => Boolean(value?.trim())).length;

  if (configuredCount === 0) {
    return "missing-production-configuration";
  }

  if (configuredCount < 3) {
    return "partial-production-configuration";
  }

  return "github";
}

export function isBlogEditorGitOid(value: unknown): value is string {
  return typeof value === "string" && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(value);
}

export function resolveBlogEditorDeploymentHead(environment: {
  nodeEnv?: string;
  deploymentOid?: string;
}): BlogEditorDeploymentHeadResolution {
  const deploymentOid = environment.deploymentOid?.trim();

  if (isBlogEditorGitOid(deploymentOid)) {
    return { status: "ready", oid: deploymentOid };
  }

  return environment.nodeEnv === "production"
    ? { status: "missing-production-sha" }
    : { status: "non-production" };
}

export function isExpectedBlogEditorHead(expectedHeadOid: string, serverHeadOid: string) {
  return (
    isBlogEditorGitOid(expectedHeadOid) &&
    isBlogEditorGitOid(serverHeadOid) &&
    expectedHeadOid === serverHeadOid
  );
}
