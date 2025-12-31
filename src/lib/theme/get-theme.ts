import { getPayload } from "payload"
import config from "@payload-config"

export type NavigationStyle = "classic" | "modern" | "transparent"

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

export interface SiteTheme extends ThemeColors {
  defaultNavigationStyle: NavigationStyle
}

const DEFAULT_THEME: SiteTheme = {
  primary: "#3b82f6",
  secondary: "#1e3a5f",
  accent: "#facc15",
  defaultNavigationStyle: "classic",
}

/**
 * Fetch theme colors and navigation style from Payload CMS site settings
 */
export async function getTheme(): Promise<SiteTheme> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: "site-settings" }) as {
      theme?: {
        primaryColor?: string | null
        secondaryColor?: string | null
        accentColor?: string | null
      } | null
      defaultNavigationStyle?: NavigationStyle | null
    }

    return {
      primary: settings.theme?.primaryColor || DEFAULT_THEME.primary,
      secondary: settings.theme?.secondaryColor || DEFAULT_THEME.secondary,
      accent: settings.theme?.accentColor || DEFAULT_THEME.accent,
      defaultNavigationStyle: settings.defaultNavigationStyle || DEFAULT_THEME.defaultNavigationStyle,
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
