const path = require("node:path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ats/shared"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
}

module.exports = nextConfig
