import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { BusinessProvider } from "@/hooks/use-business"
import { TemplateProvider } from "@/hooks/use-templates"
import { LanguageProvider } from "@/contexts/language-context"
import { DraftsProvider } from "@/hooks/use-drafts"
import { InvoiceProvider } from "@/hooks/use-invoices"
import { Toaster } from "@/components/ui/toaster"
import { DatabaseStatusNotification } from "@/components/database-status-notification"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "gncy Invoice Generator",
  description: "Create and download professional invoices easily with gncy",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              <BusinessProvider>
                <TemplateProvider>
                  <InvoiceProvider>
                    <DraftsProvider>
                      {children}
                      <DatabaseStatusNotification />
                      <Toaster />
                    </DraftsProvider>
                  </InvoiceProvider>
                </TemplateProvider>
              </BusinessProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'