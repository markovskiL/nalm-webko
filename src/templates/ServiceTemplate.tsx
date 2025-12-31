import { resolveHref, resolveAllHrefs, getChildPagesByParentId } from "@webko-labs/sdk"
import { i18nConfig } from "@/lib/i18n/config"
import { BlockRenderer, type SectionBlock } from "@/lib/blocks"
import { ServicePage, type ServicePageData } from "@webko-labs/ui"
import { submitFormAction } from "@/lib/forms"
import type { TemplateProps } from "./types"

export async function ServiceTemplate({ page, locale, siteSettings }: TemplateProps) {
    // Resolve sections
    const sections = resolveAllHrefs(
        page.sections ?? [],
        locale,
        i18nConfig.defaultLocale
    ) as SectionBlock[]

    const parent = page.parent as { id?: number; title?: string; pathname?: string } | null

    // Fetch sibling services (other children of the same parent)
    let siblingServices: Array<
        {
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
            locale,
            i18nConfig.defaultLocale
        )

        siblingServices = siblings.map((s) => (
            {
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
                page={
                    {
                        title: page.title,
                        parentTitle: parent?.title,
                        parentPathname: parent?.pathname ? resolveHref(parent.pathname, locale, i18nConfig.defaultLocale) : undefined,
                        serviceData: page.serviceData as ServicePageData["serviceData"],
                    }}
                siblingServices={siblingServices}
            >
                {
                    sections.length > 0 && (
                        <BlockRenderer
                            blocks={sections}
                            siteSettings={siteSettings}
                            submitAction={submitFormAction}
                        />
                    )}
            </ServicePage>
        </main>
    )
}