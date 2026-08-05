/**
 * Types for the build trigger filter.
 *
 * The filter itself stays plain JavaScript because Vercel runs it with bare
 * `node`, before any build tooling exists. This declaration lets the test
 * import it under the repository's `allowJs: false` TypeScript setup.
 */

export type PathVerdict = "build" | "skip" | "unknown";

export interface BuildDecision {
  build: boolean;
  reason: string;
  buildFiles: string[];
  skipFiles: string[];
  unknownFiles: string[];
}

export interface ChangedFiles {
  files: string[];
  range: string;
  emptyRangeIsNoop?: boolean;
}

export declare const BUILD_PATTERNS: string[];
export declare const SKIP_PATTERNS: string[];

export declare function classifyPath(file: string): PathVerdict;
export declare function decide(
  files: string[] | null | undefined,
  options?: { emptyRangeIsNoop?: boolean }
): BuildDecision;
export declare function changedFiles(env?: NodeJS.ProcessEnv): ChangedFiles | null;
