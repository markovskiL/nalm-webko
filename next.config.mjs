import { withPayload } from "@payloadcms/next/withPayload"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse server URL for remote images
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
const serverUrlPattern = serverUrl ? (() => {
  try {
    const url = new URL(serverUrl)
    return { protocol: url.protocol.replace(":", ""), hostname: url.hostname }
  } catch {
    return null
  }
})() : null

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ...(serverUrlPattern ? [serverUrlPattern] : []),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      "@payload-config": path.resolve(__dirname, "src/payload.config.ts"),
    }
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    }
    return webpackConfig
  },
  serverExternalPackages: ["sharp", "graphql"],
  transpilePackages: ["@webko-labs/sdk", "@webko-labs/ui", "@webko-labs/payload-config"],
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
