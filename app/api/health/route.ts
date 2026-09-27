/**
 * GET /api/health
 *
 * Reports whether this deployment is actually configured, so a post-deploy
 * check can catch what a pre-deploy secret check cannot: a value that was set in
 * the build environment but not the runtime one, or set to the wrong thing.
 *
 * Returns 200 when every required variable is present, 503 when any is missing.
 * That makes it usable directly as a smoke test (`curl --fail`) and as an uptime
 * probe.
 *
 * It reports only *presence* and never a value, not even a prefix or length — a
 * health endpoint is unauthenticated, so anything it returns is public. Variable
 * names are already public (they are documented in `.env.local.example`); their
 * contents are the secret.
 */
import { NextResponse } from "next/server";
import { checkConfig } from "@/lib/config/requirements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = checkConfig();

  return NextResponse.json(
    {
      status: report.ok ? "ok" : "misconfigured",
      // Names only — see the note above on why no values appear here.
      missingRequired: report.problems.map((problem) => problem.name),
      missingRecommended: report.warnings.map((problem) => problem.name),
      checkedAt: new Date().toISOString(),
    },
    {
      status: report.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
