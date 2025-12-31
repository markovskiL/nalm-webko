/**
 * Pre-build script: Generate i18n config from Payload CMS
 *
 * This script fetches the Languages global from Payload and generates
 * the i18n config file with the enabled locales and default language.
 *
 * Run: pnpm prebuild (runs automatically before pnpm build)
 */

// @ts-ignore - dotenv is available in target sites
import "dotenv/config"
import { getPayload } from "payload"
import config from "@payload-config"
import fs from "fs"
import path from "path"

interface LanguageEntry {
  code: string
  label: string
  enabled: boolean
}

interface LanguagesGlobal {
  languages?: LanguageEntry[]
  defaultLanguage?: string
}

async function generateI18nConfig() {
  console.log("Generating i18n config from Payload CMS...")

  try {
    const payload = await getPayload({ config })

    const data = (await payload.findGlobal({
      slug: "languages",
      depth: 0,
    })) as LanguagesGlobal

    // Get ALL languages (for Payload CMS - keeps content accessible)
    const allLanguages = data.languages ?? []
    // Get ENABLED languages (for frontend - language switcher and routing)
    const enabledLanguages = allLanguages.filter((lang) => lang.enabled)

    if (allLanguages.length === 0) {
      console.log("No languages found, using defaults")
      allLanguages.push({ code: "en", label: "English", enabled: true })
    }

    if (enabledLanguages.length === 0) {
      console.log("No enabled languages found, using first language as enabled")
      enabledLanguages.push(allLanguages[0])
    }

    // All locales for Payload (includes disabled)
    const locales = allLanguages.map((lang) => lang.code)
    // Enabled locales for frontend (only enabled)
    const enabledLocales = enabledLanguages.map((lang) => lang.code)

    let defaultLocale = data.defaultLanguage ?? "en"

    // Ensure default locale is in the enabled list
    if (!enabledLocales.includes(defaultLocale)) {
      console.log(`Default locale "${defaultLocale}" not in enabled list, using first enabled locale`)
      defaultLocale = enabledLocales[0]
    }

    // Build locale labels object for ALL languages
    const localeLabels: Record<string, string> = {}
    for (const lang of allLanguages) {
      localeLabels[lang.code] = lang.label
    }

    // Generate the config file content
    const content = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from Payload CMS Languages global
// To update: modify languages in Payload admin, then rebuild the site

import { createI18nConfig } from "@webko-labs/i18n"

export const i18nConfig = createI18nConfig({
  enabled: true,
  locales: ${JSON.stringify(locales)} as const,
  enabledLocales: ${JSON.stringify(enabledLocales)} as const,
  defaultLocale: "${defaultLocale}",
  localeLabels: ${JSON.stringify(localeLabels, null, 4).replace(/\n/g, "\n  ")},
})

export type Locale = (typeof i18nConfig.locales)[number]
export type EnabledLocale = (typeof i18nConfig.enabledLocales)[number]
/** Locale type for Payload API calls (includes "all" for fetching all locales) */
export type PayloadLocale = Locale | "all" | undefined
export const ENABLE_LOCALIZATION = i18nConfig.enabled
`

    const outputPath = path.join(process.cwd(), "src/lib/i18n/config.ts")
    fs.writeFileSync(outputPath, content, "utf-8")

    console.log(`Generated i18n config:`)
    console.log(`  All locales: ${locales.join(", ")}`)
    console.log(`  Enabled locales: ${enabledLocales.join(", ")}`)
    console.log(`  Default: ${defaultLocale}`)
    console.log(`  Output: ${outputPath}`)

    process.exit(0)
  } catch (error) {
    console.error("Failed to generate i18n config:", error)
    console.log("Using existing config.ts as fallback")
    process.exit(0) // Don't fail the build
  }
}

generateI18nConfig()
