import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { Public_Sans } from "next/font/google"
import { NavigationRenderer, Footer } from "@webko-labs/ui"
import type { NavItemChild } from "@webko-labs/ui"
import { routing } from "@/lib/i18n/routing"
import { getTheme, generateThemeCSS } from "@/lib/theme/get-theme"
import {
  getNavigation,
  getFooter,
  getChildPagesByParentId,
  getPagesForFooter,
  getLanguages,
  getSiteSettings,
  getUIStrings
} from "@webko-labs/sdk"
import { i18nConfig } from "@/lib/i18n/config"

import "./globals.css"

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-public-sans",
  display: "swap",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for client components
  const messages = await getMessages()

  // Fetch navigation, footer, theme, languages, site settings, and UI strings (hrefs already resolved)
  const [navigation, footer, footerPages, theme, languagesData, siteSettings, uiStrings] = await Promise.all(
    [
      getNavigation(locale, i18nConfig.defaultLocale),
      getFooter(locale, i18nConfig.defaultLocale),
      getPagesForFooter(locale, i18nConfig.defaultLocale),
      getTheme(),
      getLanguages(),
      getSiteSettings(locale),
      getUIStrings(locale),
    ])

  // Build page dropdown children from navigation config
  const pageDropdownChildren: Record<string | number, NavItemChild[]> = {}

  if (navigation?.items) {
    await Promise.all(
      navigation.items.map(async (item) => {
        if (item.type !== "dropdown" || item.dropdownSource !== "children") return

        const parentPage = item.parentPage

        if (!parentPage || typeof parentPage === "number") return

        // Pathnames already resolved by getChildPagesByParentId
        const children = await getChildPagesByParentId(
          parentPage.id as number,
          locale,
          i18nConfig.defaultLocale
        )
        pageDropdownChildren[parentPage.id] = children.map((child) => {
          const serviceData = child.serviceData as {
            description?: string
            icon?: string
          } | undefined

          return {
            label: child.title,
            href: child.pathname,
            description: serviceData?.description ?? null,
            icon: serviceData?.icon ?? null,
          }
        })
      })
    )
  }

  return (
    <html lang={locale}>
      <head>
        {/* Inject theme colors from CMS */}
        <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(theme) }} />
      </head>
      <body className={`antialiased ${publicSans.variable}`} style={{ fontFamily: "var(--font-public-sans)" }}>
        <NextIntlClientProvider messages={messages}>
          <NavigationRenderer style={theme.defaultNavigationStyle} data={navigation} siteSettings={siteSettings} pageDropdownChildren={pageDropdownChildren} languages={languagesData.languages} uiStrings={uiStrings!.navigation} />
          {children}
          <Footer data={footer} siteSettings={siteSettings} uiStrings={uiStrings!.footerStrings} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
