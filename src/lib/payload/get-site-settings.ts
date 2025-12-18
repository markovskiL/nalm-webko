import { getPayloadClient } from "./get-payload"
import type { PayloadLocale } from "@/lib/i18n"

export interface SiteSettingsData {
  siteName?: string | null
  logo?: unknown
  favicon?: unknown
  contact?: {
    phone?: string | null
    email?: string | null
    address?: string | null
  } | null
  businessHours?: Array<{
    id: string
    day: string
    hours: string
  }> | null
  socialLinks?: Array<{
    id: string
    platform?: string | null
    url?: string | null
  }> | null
  theme?: {
    primaryColor?: string | null
    secondaryColor?: string | null
    accentColor?: string | null
  } | null
  footer?: {
    copyright?: string | null
    links?: Array<{
      id: string
      label: string
      url: string
    }> | null
  } | null
}

export async function getSiteSettings(locale?: string): Promise<SiteSettingsData | null> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: "site-settings",
      locale: locale as PayloadLocale,
      depth: 1,
    })
    return settings as SiteSettingsData
  } catch {
    return null
  }
}
