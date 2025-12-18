import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getPageByPathname, getAllPages, getChildPagesByParentId, getSiteSettings } from "@/lib/payload"
import { routing } from "@/lib/i18n/routing"
import { ENABLE_LOCALIZATION, type Locale } from "@/lib/i18n/config"
import { BlockRenderer, type SectionBlock } from "@/lib/blocks"
import { ServicePage, type ServicePageData } from "@webko-labs/ui"
import { submitFormAction } from "@/lib/forms"
import { resolveHref, resolveAllHrefs } from "@/lib/payload/resolve-links"

// Note: resolveHref is still needed for parent.pathname (not resolved by data layer)
// resolveAllHrefs is needed for dynamic page sections/blocks

export const revalidate = 60

interface PageProps {
  params: Promise<{
    locale: string
    slug?: string[]
  }>
}

function getPathnameFromSlug(slugArray?: string[]): string {
  if (!slugArray || slugArray.length === 0) return "/"
  return "/" + slugArray.join("/")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug: slugArray } = await params
  const pathname = getPathnameFromSlug(slugArray)
  const page = await getPageByPathname(
    pathname,
    ENABLE_LOCALIZATION ? locale : undefined
  )

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: (page.meta as { title?: string })?.title ?? (page.title as string),
    description: (page.meta as { description?: string })?.description,
  }
}

export async function generateStaticParams() {
  const pages = await getAllPages()

  return routing.locales.flatMap((locale) =>
    pages.map((page) => ({
      locale,
      slug: page.pathname === "/" ? [] : (page.pathname as string).slice(1).split("/"),
    }))
  )
}

export default async function Page({ params }: PageProps) {
  const { locale, slug: slugArray } = await params

  setRequestLocale(locale)

  const pathname = getPathnameFromSlug(slugArray)
  const [page, siteSettings] = await Promise.all([
    getPageByPathname(pathname, ENABLE_LOCALIZATION ? (locale as Locale) : undefined),
    getSiteSettings(ENABLE_LOCALIZATION ? locale : undefined),
  ])

  if (!page) {
    notFound()
  }

  // Resolve all hrefs in sections and cast to SectionBlock array
  const sections = resolveAllHrefs(page.sections ?? [], locale) as SectionBlock[]
  const template = page.template as string | undefined

  // Service template - render service page layout
  if (template === "service") {
    const parent = page.parent as { id?: number; title?: string; pathname?: string } | null

    // Fetch sibling services (other children of the same parent)
    let siblingServices: Array<{
      id: number | string
      title: string
      pathname: string
      icon?: string | null
      description?: string | null
    }> = []

    if (parent?.id) {
      // Pathnames already resolved by getChildPagesByParentId
      const siblings = await getChildPagesByParentId(
        parent.id,
        ENABLE_LOCALIZATION ? (locale as Locale) : undefined
      )
      siblingServices = siblings.map((s) => ({
        id: s.id,
        title: s.title,
        pathname: s.pathname,
        icon: (s.serviceData as { icon?: string })?.icon ?? null,
        description: (s.serviceData as { description?: string })?.description ?? null,
      }))
    }

    return (
      <main>
        <ServicePage
          page={{
            title: page.title as string,
            parentTitle: parent?.title,
            parentPathname: parent?.pathname ? resolveHref(parent.pathname, locale) : undefined,
            serviceData: page.serviceData as ServicePageData["serviceData"],
          }}
          siblingServices={siblingServices}
        >
          {sections.length > 0 && (
            <BlockRenderer
              blocks={sections}
              siteSettings={siteSettings as Record<string, unknown> | null}
              submitAction={submitFormAction}
            />
          )}
        </ServicePage>
      </main>
    )
  }

  // Default rendering
  return (
    <main>
      {sections.length === 0 ? (
        <div className="py-20 px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{page.title as string}</h1>
          <p className="mt-4 text-gray-600">
            Add sections to this page in the admin panel.
          </p>
        </div>
      ) : (
        <BlockRenderer
          blocks={sections}
          siteSettings={siteSettings as Record<string, unknown> | null}
          submitAction={submitFormAction}
        />
      )}
    </main>
  )
}
