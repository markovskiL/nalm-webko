import { resolveAllHrefs } from "@webko-labs/sdk"
import { i18nConfig } from "@/lib/i18n/config"
import { BlockRenderer, type SectionBlock } from "@/lib/blocks"
import { submitFormAction } from "@/lib/forms"
import type { TemplateProps } from "./types"

export function DefaultTemplate({ page, locale, siteSettings }: TemplateProps) {
    // Resolve sections
    const sections = resolveAllHrefs(page.sections ?? [], locale, i18nConfig.defaultLocale) as SectionBlock[]

    return (
        <main>
            {sections.length === 0 ? (
                <div className="py-20 px-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
                    <p className="mt-4 text-gray-600">
                        Add sections to this page in the admin panel.
                    </p>
                </div>
            ) : (
                <BlockRenderer
                    blocks={sections}
                    siteSettings={siteSettings}
                    submitAction={submitFormAction}
                />
            )}
        </main>
    )
}