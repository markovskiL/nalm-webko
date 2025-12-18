import { i18nConfig } from "@/lib/i18n/config"

/**
 * Link field data structure from Payload CMS.
 * This is what the linkField() utility produces.
 */
export interface PayloadLink {
  type: "internal" | "external" | "anchor"
  page?: { id: number; pathname: string; title?: string } | number | null
  url?: string | null
  anchor?: string | null
  newTab?: boolean
}

/**
 * Resolved link with computed href.
 */
export interface ResolvedLink extends PayloadLink {
  href: string
}

/**
 * Checks if a value is a Payload link field object.
 */
function isLinkField(value: unknown): value is PayloadLink {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return (
    "type" in obj &&
    (obj.type === "internal" || obj.type === "external" || obj.type === "anchor")
  )
}

/**
 * Resolves a single href with locale prefix if needed.
 *
 * Rules:
 * - Anchors (#contact) -> unchanged
 * - External URLs (http://, https://, //) -> unchanged
 * - Default locale -> no prefix (as-needed strategy)
 * - Other locales -> add prefix
 */
export function resolveHref(
  href: string | null | undefined,
  locale: string
): string {
  if (!href) return ""

  // Skip anchors
  if (href.startsWith("#")) {
    return href
  }

  // Skip external URLs
  if (href.startsWith("http") || href.startsWith("//")) {
    return href
  }

  // Skip if locale prefix not needed (default locale with as-needed prefix)
  if (locale === i18nConfig.defaultLocale) {
    return href
  }

  // Add locale prefix to internal paths
  const normalizedHref = href.startsWith("/") ? href : `/${href}`
  return `/${locale}${normalizedHref}`
}

/**
 * Resolves a Payload link field object to include computed href.
 *
 * @example
 * // Internal link
 * resolveLink({ type: "internal", page: { pathname: "/services" } }, "de")
 * // => { type: "internal", page: {...}, href: "/de/services" }
 *
 * // External link
 * resolveLink({ type: "external", url: "https://example.com" }, "de")
 * // => { type: "external", url: "https://example.com", href: "https://example.com" }
 *
 * // Anchor link
 * resolveLink({ type: "anchor", anchor: "contact" }, "de")
 * // => { type: "anchor", anchor: "contact", href: "#contact" }
 */
export function resolveLink(link: PayloadLink, locale: string): ResolvedLink {
  let href = ""

  switch (link.type) {
    case "internal": {
      // Get pathname from page relationship
      const pathname =
        typeof link.page === "object" && link.page?.pathname
          ? link.page.pathname
          : null
      href = resolveHref(pathname, locale)
      break
    }
    case "external":
      href = link.url ?? ""
      break
    case "anchor": {
      const anchor = link.anchor ?? ""
      href = anchor.startsWith("#") ? anchor : `#${anchor}`
      break
    }
  }

  return { ...link, href }
}

/**
 * Resolves hrefs in an array of items with href property.
 * Skips processing for default locale (no changes needed).
 */
export function resolveNavLinks<T extends { href?: string | null }>(
  items: T[],
  locale: string
): T[] {
  // Skip for default locale - no prefix needed
  if (locale === i18nConfig.defaultLocale) return items

  return items.map((item) => ({
    ...item,
    href: resolveHref(item.href, locale),
  }))
}

/**
 * Recursively resolves all links in an object tree.
 *
 * Handles:
 * 1. Link field objects: { type: "internal"|"external"|"anchor", page?, url?, anchor? }
 *    -> Adds computed `href` property
 * 2. Pathname strings: fields named "pathname" (from page objects)
 *    -> Adds locale prefix to internal paths
 */
export function resolveAllHrefs<T>(data: T, locale: string): T {
  if (!data || typeof data !== "object") return data

  if (Array.isArray(data)) {
    return data.map((item) => resolveAllHrefs(item, locale)) as T
  }

  // Check if this object is a link field (has type: internal/external/anchor)
  if (isLinkField(data)) {
    return resolveLink(data, locale) as T
  }

  const resolved = { ...data } as Record<string, unknown>

  for (const key of Object.keys(resolved)) {
    const value = resolved[key]

    // Check if this is a link field object
    if (isLinkField(value)) {
      resolved[key] = resolveLink(value, locale)
    }
    // Resolve pathname fields (pages have pathname, not link objects)
    else if (key === "pathname" && typeof value === "string") {
      resolved[key] = resolveHref(value, locale)
    }
    // Recursively process nested objects/arrays
    else if (value && typeof value === "object") {
      resolved[key] = resolveAllHrefs(value, locale)
    }
  }

  return resolved as T
}
