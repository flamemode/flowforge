/**
 * Validates and normalizes the Supabase configuration from environment variables.
 * Handles common misconfiguration cases:
 *   - Missing env vars entirely
 *   - URL set to just the project reference (e.g. "dcumefwbymifsrfqsawp")
 *   - URL missing protocol prefix
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function normalizeSupabaseUrl(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();

  // Already a full URL
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Looks like a bare project reference (alphanumeric, 20 chars typical)
  if (/^[a-z0-9]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  // Has a dot but no protocol — e.g. "myproject.supabase.co"
  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }

  return null;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  return { url, anonKey };
}
