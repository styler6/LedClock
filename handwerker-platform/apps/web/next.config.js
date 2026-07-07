/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@handwerker/api-client",
    "@handwerker/domain",
    "@handwerker/pdf",
    "@handwerker/shared-types",
    "@handwerker/ui",
  ],
};

module.exports = nextConfig;
