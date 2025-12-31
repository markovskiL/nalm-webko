import type { Page } from "@/payload-types"

export interface TemplateProps 
{
    page: Page
    locale: string
    siteSettings: Record<string, unknown> | null
}
