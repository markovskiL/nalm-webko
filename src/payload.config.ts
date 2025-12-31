// Webko site configuration
import {
  createPayloadConfig,
  allCollections, allGlobals,
} from "@webko-labs/payload-config"

export default createPayloadConfig({
  siteName: "My Site",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET || "",
  databaseURL: process.env.POSTGRES_URL || "",
  blobToken: process.env.BLOB_READ_WRITE_TOKEN,
  collections: allCollections,
  globals: allGlobals,
  overrides: 
  {
    typescript: 
    {
      outputFile: "src/payload-types.ts",
    },
  },
  locales: [
    { label: "English", code: "en" },
    { label: "Български", code: "bg" },
  ],
  defaultLocale: "en",
  seo: {
    collections: ["pages"],
    globals: ["site-settings"],
  },
})
