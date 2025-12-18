import { getPayloadClient } from "./get-payload"
import { resolveAllHrefs } from "./resolve-links"
import type { NavigationData } from "@webko-labs/ui"
import type { PayloadLocale } from "@/lib/i18n"

export async function getNavigation(locale?: string): Promise<NavigationData | null> {
  try {
    const payload = await getPayloadClient()
    const navigation = await payload.findGlobal({
      slug: "navigation",
      locale: locale as PayloadLocale,
      depth: 2,
    })

    // Resolve all hrefs with locale prefix
    return locale
      ? resolveAllHrefs(navigation as NavigationData, locale)
      : (navigation as NavigationData)
  } catch {
    return null
  }
}
