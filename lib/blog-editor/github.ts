import "server-only";

import { Buffer } from "node:buffer";
import { createSign } from "node:crypto";
import { stat } from "node:fs/promises";
import path from "node:path";

import type {
  BlogEditorCommitResult,
  BlogEditorCoverUpload,
  BlogEditorPostDocument,
  BlogEditorPostsSnapshot,
  BlogEditorPostSnapshot
} from "@/lib/blog-editor/types";
import {
  deleteLocalBlogPost,
  getLocalBlogContentOid,
  readLocalBlogPostDocument,
  readLocalBlogPostDocuments,
  saveLocalBlogPost
} from "@/lib/blog-editor/local";
import {
  isBlogEditorGitOid,
  isExpectedBlogEditorHead,
  resolveBlogEditorDeploymentHead,
  resolveBlogEditorPersistenceMode
} from "@/lib/blog-editor/persistence-policy";
import { serializeBlogPostFiles } from "@/lib/blog-editor/serialization";
import {
  assertValidBlogSlug,
  BlogEditorValidationError,
  blogOwnedCoverPath,
  toBlogEditorCoverImage,
  validateBlogCoverImage,
  validateBlogPostDocument
} from "@/lib/blog-editor/validation";

const GITHUB_API_VERSION = "2026-03-10";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

async function assertExistingCoverAsset(cover: string) {
  try {
    const asset = await stat(
      path.join(process.cwd(), "public", cover.replace(/^\//, ""))
    );

    if (asset.isFile()) {
      return;
    }
  } catch {
    // Return the same user-facing validation result for missing and unreadable assets.
  }

  throw new BlogEditorValidationError([
    { field: "cover", message: "현재 배포에서 찾을 수 있는 이미지 경로를 입력해 주세요." }
  ]);
}

type GitHubEditorConfig = {
  appId: string;
  privateKey: string;
  installationId: string;
  repositoryNameWithOwner: string;
  branchName: string;
};

type InstallationToken = {
  token: string;
  expiresAt: number;
};

type GraphQLError = {
  message?: string;
  type?: string;
};

let installationTokenCache: InstallationToken | undefined;

export class BlogEditorConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogEditorConfigurationError";
  }
}

export class BlogEditorConflictError extends Error {
  readonly code = "BLOG_HEAD_CONFLICT";
  readonly status = 409;

  constructor(message = "다른 변경이 먼저 저장되었습니다. 최신 버전을 불러온 뒤 다시 시도해 주세요.") {
    super(message);
    this.name = "BlogEditorConflictError";
  }
}

export class BlogEditorGitHubError extends Error {
  readonly status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "BlogEditorGitHubError";
    this.status = status;
  }
}

function requireEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new BlogEditorConfigurationError(`${name} 환경 변수가 필요합니다.`);
  }

  return value;
}

function getGitHubEditorConfig(): GitHubEditorConfig {
  const repositoryNameWithOwner =
    process.env.BLOG_GITHUB_REPOSITORY?.trim() || "nimdalkr/nimdalxyz";
  const branchName = process.env.BLOG_GITHUB_BRANCH?.trim() || "main";

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repositoryNameWithOwner)) {
    throw new BlogEditorConfigurationError(
      "BLOG_GITHUB_REPOSITORY는 owner/repository 형식이어야 합니다."
    );
  }

  if (
    branchName.length > 240 ||
    branchName.startsWith("/") ||
    branchName.endsWith("/") ||
    branchName.includes("..") ||
    branchName.includes("//") ||
    /[~^:?*\[\\\s]/.test(branchName)
  ) {
    throw new BlogEditorConfigurationError("BLOG_GITHUB_BRANCH 값이 유효하지 않습니다.");
  }

  return {
    appId: requireEnvironmentValue("BLOG_GITHUB_APP_ID"),
    privateKey: requireEnvironmentValue("BLOG_GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n"),
    installationId: requireEnvironmentValue("BLOG_GITHUB_APP_INSTALLATION_ID"),
    repositoryNameWithOwner,
    branchName
  };
}

function shouldUseGitHubPersistence() {
  const mode = resolveBlogEditorPersistenceMode({
    nodeEnv: process.env.NODE_ENV,
    appId: process.env.BLOG_GITHUB_APP_ID,
    privateKey: process.env.BLOG_GITHUB_APP_PRIVATE_KEY,
    installationId: process.env.BLOG_GITHUB_APP_INSTALLATION_ID
  });

  if (mode === "partial-production-configuration") {
    throw new BlogEditorConfigurationError(
      "BLOG GitHub App 환경 변수는 세 값을 모두 설정해야 합니다."
    );
  }

  if (mode === "missing-production-configuration") {
    throw new BlogEditorConfigurationError(
      "프로덕션 BLOG 편집에는 GitHub App 환경 변수가 필요합니다."
    );
  }

  return mode === "github";
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function createGitHubAppJwt(config: GitHubEditorConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: config.appId
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64Url(signer.sign(config.privateKey))}`;
}

function githubHeaders(authorization: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: authorization,
    "Content-Type": "application/json",
    "User-Agent": "nimdal-blog-editor",
    "X-GitHub-Api-Version": GITHUB_API_VERSION
  };
}

async function requestInstallationToken(config: GitHubEditorConfig) {
  const response = await fetch(
    `https://api.github.com/app/installations/${encodeURIComponent(config.installationId)}/access_tokens`,
    {
      method: "POST",
      headers: githubHeaders(`Bearer ${createGitHubAppJwt(config)}`),
      body: JSON.stringify({
        repositories: [config.repositoryNameWithOwner.split("/")[1]],
        permissions: { contents: "write" }
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new BlogEditorGitHubError(
      `GitHub 설치 토큰을 발급하지 못했습니다. (${response.status})`,
      response.status
    );
  }

  const result = (await response.json()) as { token?: string; expires_at?: string };
  const expiresAt = result.expires_at ? Date.parse(result.expires_at) : Number.NaN;

  if (!result.token || Number.isNaN(expiresAt)) {
    throw new BlogEditorGitHubError("GitHub 설치 토큰 응답이 올바르지 않습니다.");
  }

  installationTokenCache = { token: result.token, expiresAt };
  return result.token;
}

export async function getGitHubInstallationToken(options: { forceRefresh?: boolean } = {}) {
  if (
    !options.forceRefresh &&
    installationTokenCache &&
    installationTokenCache.expiresAt - Date.now() > 5 * 60 * 1000
  ) {
    return installationTokenCache.token;
  }

  return requestInstallationToken(getGitHubEditorConfig());
}

async function githubGraphQL<T>(query: string, variables: Record<string, unknown>) {
  async function request(forceRefresh: boolean) {
    const token = await getGitHubInstallationToken({ forceRefresh });
    return fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: githubHeaders(`Bearer ${token}`),
      body: JSON.stringify({ query, variables }),
      cache: "no-store"
    });
  }

  let response = await request(false);

  if (response.status === 401) {
    installationTokenCache = undefined;
    response = await request(true);
  }

  if (!response.ok) {
    throw new BlogEditorGitHubError(
      `GitHub API 요청에 실패했습니다. (${response.status})`,
      response.status
    );
  }

  const result = (await response.json()) as { data?: T; errors?: GraphQLError[] };

  if (result.errors?.length) {
    const message = result.errors.map((error) => error.message ?? "GitHub GraphQL 오류").join("\n");

    if (
      result.errors.some((error) => error.type === "STALE_DATA") ||
      /expectedHeadOid|head oid|does not match the head|branch was modified|expected branch to point|pull and try again/i.test(
        message
      )
    ) {
      throw new BlogEditorConflictError();
    }

    throw new BlogEditorGitHubError(message);
  }

  if (!result.data) {
    throw new BlogEditorGitHubError("GitHub API 응답에 데이터가 없습니다.");
  }

  return result.data;
}

async function getRemoteBlogEditorHeadOid() {
  const config = getGitHubEditorConfig();
  const result = await githubGraphQL<{
    repository?: { ref?: { target?: { oid?: string } } };
  }>(
    `query BlogEditorHead($owner: String!, $name: String!, $qualifiedName: String!) {
      repository(owner: $owner, name: $name) {
        ref(qualifiedName: $qualifiedName) {
          target { oid }
        }
      }
    }`,
    {
      owner: config.repositoryNameWithOwner.split("/")[0],
      name: config.repositoryNameWithOwner.split("/")[1],
      qualifiedName: `refs/heads/${config.branchName}`
    }
  );
  const oid = result.repository?.ref?.target?.oid;

  if (!oid) {
    throw new BlogEditorGitHubError("편집 브랜치의 HEAD를 찾을 수 없습니다.", 404);
  }

  return oid;
}

export async function getBlogEditorHeadOid() {
  if (!shouldUseGitHubPersistence()) {
    return getLocalBlogContentOid();
  }

  // The document snapshot is read from this deployment. Pair it with the
  // deployment commit, not a potentially newer branch HEAD, so a save cannot
  // overwrite content that was committed while the next deployment is pending.
  const deploymentHead = resolveBlogEditorDeploymentHead({
    nodeEnv: process.env.NODE_ENV,
    deploymentOid: process.env.VERCEL_GIT_COMMIT_SHA
  });

  if (deploymentHead.status === "ready") {
    return deploymentHead.oid;
  }

  if (deploymentHead.status === "missing-production-sha") {
    throw new BlogEditorConfigurationError(
      "프로덕션 BLOG 편집에는 유효한 VERCEL_GIT_COMMIT_SHA가 필요합니다."
    );
  }

  return getRemoteBlogEditorHeadOid();
}

async function assertExpectedEditorHead(expectedHeadOid: string) {
  const serverHeadOid = await getBlogEditorHeadOid();

  if (!isExpectedBlogEditorHead(expectedHeadOid, serverHeadOid)) {
    throw new BlogEditorConflictError(
      "저장 기준 버전이 현재 배포와 일치하지 않습니다. 페이지를 새로고침해 주세요."
    );
  }
}

type CommitFileChange = {
  path: string;
  contents: Uint8Array | string;
};

async function createCommit(input: {
  message: string;
  expectedHeadOid: string;
  additions?: CommitFileChange[];
  deletions?: string[];
}) {
  if (!isBlogEditorGitOid(input.expectedHeadOid)) {
    throw new BlogEditorConflictError("저장 기준 버전이 올바르지 않습니다. 페이지를 새로고침해 주세요.");
  }

  const config = getGitHubEditorConfig();
  const additions = input.additions?.map(({ path, contents }) => ({
    path,
    contents: Buffer.from(contents).toString("base64")
  }));
  const deletions = input.deletions?.map((path) => ({ path }));
  const result = await githubGraphQL<{
    createCommitOnBranch?: { commit?: BlogEditorCommitResult };
  }>(
    `mutation SaveBlogPost($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit { oid url committedDate }
      }
    }`,
    {
      input: {
        branch: {
          repositoryNameWithOwner: config.repositoryNameWithOwner,
          branchName: config.branchName
        },
        message: { headline: input.message.slice(0, 72) },
        expectedHeadOid: input.expectedHeadOid,
        fileChanges: {
          ...(additions?.length ? { additions } : {}),
          ...(deletions?.length ? { deletions } : {})
        }
      }
    }
  );
  const commit = result.createCommitOnBranch?.commit;

  if (!commit?.oid || !commit.url || !commit.committedDate) {
    throw new BlogEditorGitHubError("GitHub 커밋 결과가 올바르지 않습니다.");
  }

  return commit;
}

type SaveBlogPostInput = {
  document: BlogEditorPostDocument;
  expectedHeadOid: string;
  coverImage?: BlogEditorCoverUpload;
};

export async function saveBlogPostToGitHub(input: SaveBlogPostInput): Promise<BlogEditorCommitResult>;
export async function saveBlogPostToGitHub(
  document: BlogEditorPostDocument,
  expectedHeadOid: string,
  coverImage?: BlogEditorCoverUpload
): Promise<BlogEditorCommitResult>;
export async function saveBlogPostToGitHub(
  inputOrDocument: SaveBlogPostInput | BlogEditorPostDocument,
  expectedHeadOid?: string,
  coverUpload?: BlogEditorCoverUpload
) {
  const input: SaveBlogPostInput =
    "document" in inputOrDocument
      ? inputOrDocument
      : {
          document: inputOrDocument,
          expectedHeadOid: expectedHeadOid ?? "",
          coverImage: coverUpload
        };
  const document: BlogEditorPostDocument = {
    ...input.document,
    ko: { ...input.document.ko, tags: [...input.document.ko.tags] },
    en: { ...input.document.en, tags: [...input.document.en.tags] }
  };
  const additions: CommitFileChange[] = [];
  const coverImage = input.coverImage
    ? await toBlogEditorCoverImage(input.coverImage)
    : undefined;

  if (coverImage) {
    const image = validateBlogCoverImage(coverImage);
    document.cover = `/media/blog/${document.slug}/cover.${image.extension}`;
    additions.push({
      path: `public${document.cover}`,
      contents: image.bytes
    });
  }

  validateBlogPostDocument(document);

  if (!coverImage) {
    await assertExistingCoverAsset(document.cover);
  }

  const useGitHubPersistence = shouldUseGitHubPersistence();

  if (!useGitHubPersistence) {
    try {
      const oid = await saveLocalBlogPost({
        document,
        expectedHeadOid: input.expectedHeadOid,
        coverImage
      });

      return {
        oid,
        url: `file://${process.cwd()}/content/blog/posts/${document.slug}`,
        committedDate: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error && error.name === "BlogEditorLocalConflictError") {
        throw new BlogEditorConflictError(error.message);
      }

      throw error;
    }
  }

  await assertExpectedEditorHead(input.expectedHeadOid);
  const existingDocument = await readLocalBlogPostDocument(document.slug);
  const oldCover = existingDocument
    ? blogOwnedCoverPath(document.slug, existingDocument.cover)
    : undefined;
  const newCover = blogOwnedCoverPath(document.slug, document.cover);
  additions.unshift(...serializeBlogPostFiles(document));

  return createCommit({
    message: `${document.status === "published" ? "Publish" : "Save draft"}: ${document.slug}`,
    expectedHeadOid: input.expectedHeadOid,
    additions,
    deletions: oldCover && oldCover !== newCover ? [`public${oldCover}`] : undefined
  });
}

type DeleteBlogPostInput = {
  slug: string;
  expectedHeadOid: string;
};

export async function deleteBlogPostFromGitHub(
  input: DeleteBlogPostInput
): Promise<BlogEditorCommitResult>;
export async function deleteBlogPostFromGitHub(
  slug: string,
  expectedHeadOid: string
): Promise<BlogEditorCommitResult>;
export async function deleteBlogPostFromGitHub(
  inputOrSlug: DeleteBlogPostInput | string,
  expectedHeadOid?: string
) {
  const input: DeleteBlogPostInput =
    typeof inputOrSlug === "string"
      ? { slug: inputOrSlug, expectedHeadOid: expectedHeadOid ?? "" }
      : inputOrSlug;
  assertValidBlogSlug(input.slug);

  const useGitHubPersistence = shouldUseGitHubPersistence();

  if (!useGitHubPersistence) {
    try {
      const oid = await deleteLocalBlogPost(input);
      return {
        oid,
        url: `file://${process.cwd()}/content/blog/posts`,
        committedDate: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error && error.name === "BlogEditorLocalConflictError") {
        throw new BlogEditorConflictError(error.message);
      }
      throw error;
    }
  }

  await assertExpectedEditorHead(input.expectedHeadOid);
  const directory = `content/blog/posts/${input.slug}`;
  const existingDocument = await readLocalBlogPostDocument(input.slug);
  const cover = existingDocument
    ? blogOwnedCoverPath(input.slug, existingDocument.cover)
    : undefined;

  return createCommit({
    message: `Delete post: ${input.slug}`,
    expectedHeadOid: input.expectedHeadOid,
    deletions: [
      `${directory}/index.yaml`,
      `${directory}/bodyKo.md`,
      `${directory}/bodyEn.md`,
      ...(cover ? [`public${cover}`] : [])
    ]
  });
}

export async function readBlogPostDocument(slug: string) {
  return readLocalBlogPostDocument(slug);
}

export async function getBlogEditorPosts(): Promise<BlogEditorPostsSnapshot> {
  const [posts, expectedHeadOid] = await Promise.all([
    readLocalBlogPostDocuments(),
    getBlogEditorHeadOid()
  ]);

  return { posts, expectedHeadOid };
}

export async function getBlogEditorPost(slug: string): Promise<BlogEditorPostSnapshot | undefined> {
  const [document, expectedHeadOid] = await Promise.all([
    readLocalBlogPostDocument(slug),
    getBlogEditorHeadOid()
  ]);

  return document ? { document, expectedHeadOid } : undefined;
}

export function isBlogEditorConflictError(error: unknown): error is BlogEditorConflictError {
  return error instanceof BlogEditorConflictError;
}
