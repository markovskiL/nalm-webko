import { createI18nConfig } from "@webko-labs/i18n"

export const i18nConfig = createI18nConfig({
  enabled: true,
  locales: ["en", "mk"] as const,
  enabledLocales: ["en", "mk"] as const,
  defaultLocale: "en",
  localeLabels: {
    en: "English",
    mk: "Македонски",
  },
})

export type Locale = (typeof i18nConfig.locales)[number]
/** Locale type for Payload API calls (includes "all" for fetching all locales) */
export type PayloadLocale = Locale | "all" | undefined
export const ENABLE_LOCALIZATION = i18nConfig.enabled
