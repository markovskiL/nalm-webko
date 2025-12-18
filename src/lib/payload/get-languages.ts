import { getPayloadClient } from "./get-payload"

export interface LanguageConfig {
  code: string
  label: string
  enabled: boolean
}

export interface LanguagesData {
  languages: LanguageConfig[]
  defaultLanguage: string
}

interface LanguagesGlobal {
  languages?: LanguageConfig[]
  defaultLanguage?: string
}

export async function getLanguages(): Promise<LanguagesData> {
  try {
    const payload = await getPayloadClient()
    const data = await payload.findGlobal(
    {
      slug: "languages",
      depth: 0,
    }) as LanguagesGlobal

    // Filter to only enabled languages
    const enabledLanguages = data.languages?.filter((lang) => lang.enabled)

    return {
      languages: enabledLanguages ?? [],
      defaultLanguage: data.defaultLanguage ?? "en",
    }
  } catch
  {
    // Return defaults if global doesn't exist yet
    return {
      languages: [],
      defaultLanguage: "en",
    }
  }
}
