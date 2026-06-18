const BASE_URL = "https://seeclickfix.com/api/v2";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 800;

export interface SeeClickFixIssue {
  summary: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  reporterName: string;
}

export class SeeClickFixError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = "SeeClickFixError";
  }
}

/**
 * Submit a civic infrastructure report to SeeClickFix (city 311 routing).
 *
 * Returns the SeeClickFix issue ID on success.
 * Throws SeeClickFixError on failure — callers should catch and handle
 * gracefully (the report is already saved locally in Supabase).
 *
 * Retries up to MAX_ATTEMPTS times with exponential backoff for
 * transient network or server errors.
 */
export async function submitCivicReport(issue: SeeClickFixIssue): Promise<string> {
  const apiKey = process.env.SEECLICKFIX_API_KEY;
  if (!apiKey) {
    throw new SeeClickFixError("SEECLICKFIX_API_KEY is not configured", undefined, false);
  }

  const body = {
    issue: {
      summary: issue.summary,
      description: issue.description,
      lat: issue.lat,
      lng: issue.lng,
      address: issue.address,
      reporter: { name: issue.reporterName },
    },
  };

  let lastError: SeeClickFixError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token token="${apiKey}"`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        const data = await res.json();
        const id = data?.issue?.id ?? data?.id;
        if (!id) {
          throw new SeeClickFixError(
            "SeeClickFix returned a successful response but no issue ID",
            res.status,
            false
          );
        }
        return String(id);
      }

      // 4xx errors are not retryable (bad request, auth failure, etc.)
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "");
        throw new SeeClickFixError(
          `SeeClickFix rejected the request: ${res.status} ${text.slice(0, 200)}`,
          res.status,
          false
        );
      }

      // 5xx or other server errors are retryable
      lastError = new SeeClickFixError(`SeeClickFix server error: ${res.status}`, res.status, true);
    } catch (err) {
      if (err instanceof SeeClickFixError) {
        if (!err.retryable) throw err;
        lastError = err;
      } else {
        // Network error (DNS failure, timeout, etc.) — retryable
        lastError = new SeeClickFixError(
          err instanceof Error ? err.message : "Network error",
          undefined,
          true
        );
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new SeeClickFixError("SeeClickFix unavailable after retries", undefined, true);
}

/**
 * Look up a previously submitted report by SeeClickFix ID.
 * Used to sync status updates back into civic_reports.
 */
export async function getReportStatus(seeclickfixId: string): Promise<{
  status: "open" | "acknowledged" | "closed";
  updatedAt: string;
} | null> {
  const apiKey = process.env.SEECLICKFIX_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${BASE_URL}/issues/${seeclickfixId}`, {
      headers: { Authorization: `Token token="${apiKey}"` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw = data?.issue?.status ?? data?.status ?? "";
    const updatedAt = data?.issue?.updated_at ?? data?.updated_at ?? new Date().toISOString();

    const statusMap: Record<string, "open" | "acknowledged" | "closed"> = {
      Open: "open",
      Acknowledged: "acknowledged",
      Closed: "closed",
      Archived: "closed",
    };

    return {
      status: statusMap[raw] ?? "open",
      updatedAt,
    };
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
