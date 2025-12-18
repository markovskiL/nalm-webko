import { getPayloadClient } from "./get-payload"
import { resolveNavLinks } from "./resolve-links"
import type { PayloadLocale } from "@/lib/i18n"

export interface NavPageItem {
  id: string | number
  label: string
  href: string
  order: number
  parentId: string | number | null
  children?: NavPageItem[]
}

/**
 * Gets pages for navigation with hierarchy support.
 * Returns a flat list with parent references that can be built into a tree.
 */
export async function getPagesForNavigation(locale?: string): Promise<NavPageItem[]> {
  try {
    const payload = await getPayloadClient()
    const pages = await payload.find({
      collection: "pages",
      where: {
        "visibility.showInNavigation": {
          equals: true,
        },
      },
      locale: locale as PayloadLocale,
      limit: 100,
      depth: 1, // Populate parent relationship
    })

    const navPages = pages.docs
      .map((page) => {
        const parentId = typeof page.parent === "number"
          ? page.parent
          : (page.parent as { id: number } | null)?.id ?? null

        return {
          id: page.id,
          label: page.title,
          href: page.pathname,
          order: (page.visibility as { navigationOrder?: number } | undefined)?.navigationOrder ?? 0,
          parentId,
        }
      })
      .sort((a, b) => a.order - b.order)

    // Resolve hrefs with locale prefix
    return locale ? resolveNavLinks(navPages, locale) : navPages
  } catch {
    return []
  }
}

/**
 * Gets pages for navigation as a hierarchical tree structure.
 * Top-level pages have their children nested.
 */
export async function getPagesForNavigationTree(locale?: string): Promise<NavPageItem[]> {
  const flatPages = await getPagesForNavigation(locale)

  // Build lookup map
  const pageMap = new Map<string | number, NavPageItem>()
  flatPages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] })
  })

  // Build tree
  const rootPages: NavPageItem[] = []

  flatPages.forEach(page => {
    const pageWithChildren = pageMap.get(page.id)!

    if (page.parentId !== null && pageMap.has(page.parentId)) {
      // Has parent in nav - add as child
      const parent = pageMap.get(page.parentId)!
      parent.children = parent.children || []
      parent.children.push(pageWithChildren)
    } else {
      // No parent in nav - top level
      rootPages.push(pageWithChildren)
    }
  })

  // Sort children
  rootPages.forEach(page => {
    if (page.children) {
      page.children.sort((a, b) => a.order - b.order)
    }
  })

  return rootPages.sort((a, b) => a.order - b.order)
}
