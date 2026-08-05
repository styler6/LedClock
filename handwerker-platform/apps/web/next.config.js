const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle for a lean Docker image.
  output: "standalone",
  // In a monorepo, trace files from the repo root so workspace packages are included.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@handwerker/api-client",
    "@handwerker/domain",
    "@handwerker/pdf",
    "@handwerker/shared-types",
    "@handwerker/ui",
  ],
};

module.exports = nextConfig;
