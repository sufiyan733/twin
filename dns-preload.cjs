/**
 * Preload script: forces Google Public DNS for all DNS lookups.
 * Loaded via NODE_OPTIONS="--require ./dns-preload.cjs" in the dev script.
 *
 * This fixes mongodb+srv:// SRV lookup failures on networks whose
 * default DNS resolver refuses SRV queries.
 */
const dns = require("node:dns");

try {
  const current = dns.getServers();
  const hasGoogle = current.some((s) => s === "8.8.8.8" || s === "8.8.4.4");

  if (!hasGoogle) {
    dns.setServers(["8.8.8.8", "8.8.4.4", ...current]);
    console.log("[dns-preload] Forced Google DNS for SRV lookups");
  }
} catch (e) {
  // Ignore — fall back to OS resolver.
}
