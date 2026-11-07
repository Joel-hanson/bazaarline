/**
 * GitHub Pages static export.
 * Route Handlers that call `connection()` cannot be statically parsed for
 * `dynamic`, so the API app route is stashed for the export build only.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "src/app/api");
const stashDir = join(root, ".pages-stash-api");

function restoreApi() {
  if (!existsSync(stashDir)) return;
  if (existsSync(apiDir)) rmSync(apiDir, { recursive: true, force: true });
  renameSync(stashDir, apiDir);
}

if (existsSync(stashDir)) {
  rmSync(stashDir, { recursive: true, force: true });
}

if (existsSync(apiDir)) {
  renameSync(apiDir, stashDir);
}

const pagesRouteDir = join(apiDir, "insights");
mkdirSync(pagesRouteDir, { recursive: true });
writeFileSync(
  join(pagesRouteDir, "route.ts"),
  `import { getInsights } from "@/lib/market/insights";
import { toPublicPayload } from "@/lib/market/public-payload";

export const dynamic = "force-static";

export async function GET() {
  try {
    const data = toPublicPayload(await getInsights());
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
`,
);

let status = 1;
try {
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
    shell: process.platform === "win32",
  });
  status = result.status ?? 1;
  if (status === 0) {
    // GitHub Pages runs Jekyll by default; disable it so `_next` assets are published.
    writeFileSync(join(root, "out", ".nojekyll"), "");
  }
} finally {
  if (existsSync(apiDir)) {
    rmSync(apiDir, { recursive: true, force: true });
  }
  restoreApi();
}

process.exit(status);
