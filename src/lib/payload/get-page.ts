import { getPayloadClient } from "./get-payload"
import { resolveHref } from "./resolve-links"
import type { PayloadLocale } from "@/lib/i18n"

export interface BreadcrumbItem {
  title: string
  pathname: string
}

export interface PageWithBreadcrumbs {
  page: NonNullable<Awaited<ReturnType<typeof getPageByPathname>>>
  breadcrumbs: BreadcrumbItem[]
}

export async function getPageByPathname(pathname: string, locale?: string) {
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: "pages",
    where: {
      pathname: { equals: pathname },
    },
    locale: locale as PayloadLocale,
    limit: 1,
    depth: 3,
  })

  return pages.docs[0] ?? null
}

/**
 * Gets a page with its breadcrumb chain (ancestors).
 */
export async function getPageWithBreadcrumbs(
  pathname: string,
  locale?: string
): Promise<PageWithBreadcrumbs | null> {
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: "pages",
    where: {
      pathname: { equals: pathname },
    },
    locale: locale as PayloadLocale,
    limit: 1,
    depth: 3,
  })

  const page = pages.docs[0]
  if (!page) return null

  // Build breadcrumbs by walking up the parent chain
  const breadcrumbs: BreadcrumbItem[] = []
  let current = page

  while (current) {
    breadcrumbs.unshift({
      title: current.title,
      pathname: current.pathname,
    })

    // Check if page has a parent
    const parentId = typeof current.parent === "number"
      ? current.parent
      : (current.parent as { id: number } | null)?.id

    if (parentId) {
      const parentDoc = await payload.findByID({
        collection: "pages",
        id: parentId,
        locale: locale as PayloadLocale,
        depth: 0,
      })
      current = parentDoc as typeof page
    } else {
      break
    }
  }

  return { page, breadcrumbs }
}

/**
 * Gets child pages of a given parent page.
 */
export async function getChildPages(parentPathname: string, locale?: string) {
  const payload = await getPayloadClient()

  // First find the parent page
  const parentPages = await payload.find({
    collection: "pages",
    where: { pathname: { equals: parentPathname } },
    limit: 1,
    depth: 0,
  })

  const parent = parentPages.docs[0]
  if (!parent) return []

  // Then find children
  const children = await payload.find({
    collection: "pages",
    where: { parent: { equals: parent.id } },
    locale: locale as PayloadLocale,
    limit: 100,
    sort: "visibility.navigationOrder",
  })

  return children.docs
}

/**
 * Gets child pages by parent ID.
 * Returns pages with pathnames resolved for the given locale.
 */
export async function getChildPagesByParentId(parentId: number, locale?: string) {
  const payload = await getPayloadClient()

  const children = await payload.find({
    collection: "pages",
    where: { parent: { equals: parentId } },
    locale: locale as PayloadLocale,
    limit: 100,
    sort: "visibility.navigationOrder",
  })

  // Resolve pathnames with locale prefix
  if (!locale) return children.docs

  return children.docs.map((page) => ({
    ...page,
    pathname: resolveHref(page.pathname, locale),
  })) as typeof children.docs
}

export async function getAllPages(locale?: string) {
  const payload = await getPayloadClient()

  const pages = await payload.find({
    collection: "pages",
    locale: locale as PayloadLocale,
    limit: 100,
    select: {
      pathname: true,
    },
  })

  return pages.docs
}
