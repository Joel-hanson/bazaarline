import { InsightArticle } from "@/components/insights/insight-article";
import { getInsights } from "@/lib/market/insights";
import { toPublicPayload } from "@/lib/market/public-payload";
import { isGithubPagesBuild } from "@/lib/site";
import { connection } from "next/server";

export default async function Home() {
  // Live Node deploys opt into per-request rendering; GitHub Pages is static at build time.
  if (!isGithubPagesBuild()) {
    await connection();
  }

  let data;
  let errorMessage: string | null = null;

  try {
    data = toPublicPayload(await getInsights());
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Could not load market insights.";
  }

  return (
    <main className="page-shell">
      <p className="hero-brand">Bazaarline</p>
      <p className="hero-kicker">
        India market crash perspective — live index drawdowns against history.
      </p>

      {errorMessage || !data ? (
        <div className="stat-strip" role="alert">
          <p className="stat-strip__label">Unable to load data</p>
          <p className="stat-strip__hint">
            {errorMessage ?? "Unknown error. Try refreshing in a minute."}
          </p>
        </div>
      ) : (
        <InsightArticle data={data} />
      )}
    </main>
  );
}
