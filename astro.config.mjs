// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://taloninsights.co.uk",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  // The Claude Code preview harness hands out a port via $PORT.
  server: { port: Number(process.env.PORT) || 4321 },
  experimental: {
    // Astro inlines its island runtime and client-directive bootstraps as
    // inline <script>s, so a bare script-src 'self' header would block
    // hydration. This emits a meta CSP with per-build hashes instead; the
    // transport-only headers stay in vercel.json (a meta CSP cannot carry
    // frame-ancestors — X-Frame-Options there covers framing).
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://formspree.io",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://formspree.io",
        "upgrade-insecure-requests",
      ],
      styleDirective: {
        resources: ["'self'", "https://fonts.googleapis.com"],
      },
      scriptDirective: {
        resources: ["'self'"],
      },
    },
  },
});
