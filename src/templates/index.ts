import { DefaultTemplate } from "./DefaultTemplate"
import { ServiceTemplate } from "./ServiceTemplate"

// Type for the Template Component
// We return the component itself, not an instance
export const templates = 
{
    default: DefaultTemplate,
    service: ServiceTemplate,
} as const

export type TemplateType = keyof typeof templates

export function getTemplate(templateName?: string | null) 
{
    if (!templateName || !(templateName in templates)) 
    {
        return templates.default
    }
    return templates[templateName as TemplateType]
}
