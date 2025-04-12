"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Menu } from "lucide-react"
import GncyLogo from "./gncy-logo"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LanguageSelector from "./language-selector"
import { useLanguage } from "@/contexts/language-context"

export function AppHeader() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      router.push("/")
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <GncyLogo />
        </Link>

        {user && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
                {t("invoices")}
              </Link>
              <Link href="/sales" className="text-gray-600 hover:text-gray-900">
                {t("sales")}
              </Link>
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
                {t("analytics")}
              </Link>
              <LanguageSelector />
              <span className="text-sm text-gray-600">{user.email}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("settings")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("settings")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {isMobileMenuOpen && (
                <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md p-4 z-50 w-48">
                  <div className="flex flex-col space-y-3">
                    <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
                      {t("invoices")}
                    </Link>
                    <Link href="/sales" className="text-gray-600 hover:text-gray-900">
                      {t("sales")}
                    </Link>
                    <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
                      {t("analytics")}
                    </Link>
                    <div className="py-2">
                      <LanguageSelector />
                    </div>
                    <button onClick={handleSignOut} className="flex items-center text-sm text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("logout")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
