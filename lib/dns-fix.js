/**
 * Fix for local development: force Node.js to use Google Public DNS
 * for SRV record lookups (mongodb+srv:// requires SRV DNS).
 *
 * Some ISPs / IPv6 networks refuse SRV queries, which breaks
 * MongoDB Atlas connections locally even though TCP is reachable.
 *
 * This is a no-op in production (Vercel handles DNS correctly).
 */
import dns from "node:dns";

if (process.env.NODE_ENV !== "production") {
  try {
    const current = dns.getServers();
    const hasGoogle = current.some((s) => s === "8.8.8.8" || s === "8.8.4.4");

    if (!hasGoogle) {
      dns.setServers(["8.8.8.8", "8.8.4.4", ...current]);
    }
  } catch {
    // Ignore — worst case we fall back to the OS resolver.
  }
}
