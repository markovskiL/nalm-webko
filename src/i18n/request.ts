import { getRequestConfig } from "next-intl/server"
import { routing } from "@/lib/i18n/routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale
  }

  // UI strings come from CMS (uiStrings props), not JSON files
  // Return empty messages - next-intl is only used for locale routing
  return {
    locale,
    messages: {},
  }
})
