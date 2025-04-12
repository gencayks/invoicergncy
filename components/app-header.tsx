"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Menu, X, Settings, BarChart, FileText, LogOut } from "lucide-react"
import GncyLogo from "./gncy-logo"
import { LanguageSelector } from "./language-selector"

export default function AppHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      router.push("/")
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <GncyLogo className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link
                  href="/invoices"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Invoices
                </Link>
                <Link
                  href="/sales"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sales
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </>
            )}
            <LanguageSelector />
            {user ? (
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => router.push("/login")}>Sign In</Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu} className="text-gray-600">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {user && (
              <>
                <Link
                  href="/invoices"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 inline-block mr-2" />
                  Invoices
                </Link>
                <Link
                  href="/sales"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <BarChart className="h-5 w-5 inline-block mr-2" />
                  Sales
                </Link>
                <Link
                  href="/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <BarChart className="h-5 w-5 inline-block mr-2" />
                  Analytics
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5 inline-block mr-2" />
                  Settings
                </Link>
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-gray-700 px-3 py-2"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
            {!user && (
              <Button onClick={() => router.push("/login")} className="w-full">
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
