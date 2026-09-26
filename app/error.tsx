"use client";

import { useEffect, useState } from "react";
import { newCorrelationId, reportError } from "@/lib/observability/logger";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Generated per error so the id shown to the user matches the reported one.
  const [correlationId] = useState(newCorrelationId);

  useEffect(() => {
    // Replaces a bare console.error into a console nobody reads: this goes to
    // the installed reporter as well. `digest` is React's own id for the
    // server-side error, and is what ties this to the server log line.
    reportError("ui.render_error", error, {
      correlationId,
      fields: { digest: error.digest, boundary: "app/error" },
    });
  }, [error, correlationId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F6F6F6] text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border p-6">
        <h2 className="text-lg font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-sm text-[#888] mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#0F0F14] text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors w-full"
        >
          Try again
        </button>
        {/* Gives the user something to quote in a support report that points
            straight at the reported error. */}
        <p className="mt-4 text-[11px] text-[#AAA] font-mono break-all">
          Reference: {error.digest ?? correlationId}
        </p>
      </div>
    </div>
  );
}
