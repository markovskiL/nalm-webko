import { getPayload } from "payload"
import config from "@payload-config"

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

const DEFAULT_THEME: ThemeColors = {
  primary: "#3b82f6",
  secondary: "#1e3a5f",
  accent: "#facc15",
}

/**
 * Fetch theme colors from Payload CMS site settings
 */
export async function getTheme(): Promise<ThemeColors> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: "site-settings" }) as {
      theme?: {
        primaryColor?: string | null
        secondaryColor?: string | null
        accentColor?: string | null
      } | null
    }

    return {
      primary: settings.theme?.primaryColor || DEFAULT_THEME.primary,
      secondary: settings.theme?.secondaryColor || DEFAULT_THEME.secondary,
      accent: settings.theme?.accentColor || DEFAULT_THEME.accent,
    }
  } catch {
    // Fallback to defaults if CMS is unavailable
    return DEFAULT_THEME
  }
}

/**
 * Generate CSS variables string for injection into <style> tag
 */
export function generateThemeCSS(theme: ThemeColors): string {
  return `
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --ring: ${theme.primary};
    }
  `.trim()
}
