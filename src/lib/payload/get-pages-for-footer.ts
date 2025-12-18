import { getPayloadClient } from "./get-payload"
import { resolveNavLinks } from "./resolve-links"
import type { PayloadLocale } from "@/lib/i18n"

export interface FooterPageLink {
  label: string
  href: string
  order: number
}

export interface FooterLinkGroups {
  company: FooterPageLink[]
  services: FooterPageLink[]
  support: FooterPageLink[]
}

export async function getPagesForFooter(locale?: string): Promise<FooterLinkGroups> {
  try {
    const payload = await getPayloadClient()
    const pages = await payload.find({
      collection: "pages",
      where: {
        "visibility.showInFooter": {
          equals: true,
        },
      },
      locale: locale as PayloadLocale,
      limit: 100,
    })

    const groups: FooterLinkGroups = {
      company: [],
      services: [],
      support: [],
    }

    pages.docs.forEach((page) => {
      const visibility = page.visibility as { footerColumn?: string; footerOrder?: number } | undefined
      const column = visibility?.footerColumn ?? "company"
      const link: FooterPageLink = {
        label: page.title,
        href: page.pathname,
        order: visibility?.footerOrder ?? 0,
      }

      if (column in groups) {
        groups[column as keyof FooterLinkGroups].push(link)
      }
    })

    groups.company.sort((a, b) => a.order - b.order)
    groups.services.sort((a, b) => a.order - b.order)
    groups.support.sort((a, b) => a.order - b.order)

    // Resolve hrefs with locale prefix
    if (!locale) return groups

    return {
      company: resolveNavLinks(groups.company, locale),
      services: resolveNavLinks(groups.services, locale),
      support: resolveNavLinks(groups.support, locale),
    }
  } catch {
    return { company: [], services: [], support: [] }
  }
}
