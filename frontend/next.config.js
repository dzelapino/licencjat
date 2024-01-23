/**@type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // output: 'standalone',
};


const withTM = require("next-transpile-modules")([
  "react-syntax-highlighter",
  "swagger-client",
  "swagger-ui-react",
]);

module.exports = withTM(nextConfig);
