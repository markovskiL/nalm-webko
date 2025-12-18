import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { Navigation, Footer } from "@webko-labs/ui"
import type { NavItemChild } from "@webko-labs/ui"
import { routing } from "@/lib/i18n/routing"
import { getTheme, generateThemeCSS } from "@/lib/theme/get-theme"
import { getNavigation } from "@/lib/payload/get-navigation"
import { getFooter } from "@/lib/payload/get-footer"
import { getPagesForNavigation } from "@/lib/payload/get-pages-for-nav"
import { getChildPagesByParentId } from "@/lib/payload/get-page"
import { getPagesForFooter } from "@/lib/payload/get-pages-for-footer"
import { getLanguages } from "@/lib/payload/get-languages"

import "./globals.css"

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

  // Fetch navigation, footer, theme, and languages data (hrefs already resolved)
  const [navigation, footer, navPages, footerPages, theme, languagesData] = await Promise.all([
    getNavigation(locale),
    getFooter(locale),
    getPagesForNavigation(locale),
    getPagesForFooter(locale),
    getTheme(),
    getLanguages(),
  ])

  // Build page dropdown children from navigation config
  const pageDropdownChildren: Record<string | number, NavItemChild[]> = {}

  if (navigation?.pageDropdowns) {
    await Promise.all(
      navigation.pageDropdowns.map(async (dropdown) => {
        const parentPage = dropdown.parentPage
        if (!parentPage || typeof parentPage === "number") return

        // Pathnames already resolved by getChildPagesByParentId
        const children = await getChildPagesByParentId(parentPage.id as number, locale)
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
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navigation data={navigation} pageLinks={navPages} pageDropdownChildren={pageDropdownChildren} languages={languagesData.languages} />
          {children}
          <Footer data={footer} pageLinks={footerPages} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
