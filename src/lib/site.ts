/** GitHub repo: Joel-hanson/bazaarline — subpath must match the repository name for Pages. */
export const GITHUB_PAGES_BASE_PATH = "/bazaarline";

export function isGithubPagesBuild(): boolean {
  return process.env.GITHUB_PAGES === "true";
}

export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}
