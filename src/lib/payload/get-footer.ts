import { getPayloadClient } from "./get-payload"
import { resolveAllHrefs } from "./resolve-links"
import type { FooterData } from "@webko-labs/ui"
import type { PayloadLocale } from "@/lib/i18n"

export async function getFooter(locale?: string): Promise<FooterData | null> {
  try {
    const payload = await getPayloadClient()
    const footer = await payload.findGlobal({
      slug: "footer",
      locale: locale as PayloadLocale,
      depth: 2,
    })

    // Resolve all hrefs with locale prefix
    return locale
      ? resolveAllHrefs(footer as FooterData, locale)
      : (footer as FooterData)
  } catch {
    return null
  }
}
