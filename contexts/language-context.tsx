"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "en" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const translations: Record<string, Record<string, string>> = {
    en: {
      invoices: "Invoices",
      sales: "Sales",
      settings: "Settings",
      logout: "Logout",
      createInvoice: "Create Invoice",
      saveAsDraft: "Save as Draft",
      generatePdf: "Generate PDF",
      number: "Number",
      date: "Date",
      status: "Status",
      amount: "Amount",
      actions: "Actions",
      confirmDelete: "Confirm Delete",
      confirmDeleteInvoiceMessage: "Are you sure you want to delete this invoice?",
      cancel: "Cancel",
      delete: "Delete",
      somethingWentWrong: "Something went wrong!",
      errorOccurred: "An unexpected error occurred.",
      tryAgain: "Try Again",
      goHome: "Go Home",
      errorLoadingInvoices: "Error loading invoices",
      noInvoices: "No Invoices",
      noInvoicesMessage: "You haven't created any invoices yet.",
      refreshed: "Refreshed",
      invoicesRefreshed: "Invoices have been refreshed.",
      deleted: "Deleted",
      invoiceDeleted: "Invoice has been deleted.",
      createInvoice: "Create Invoice",
      edit: "Edit",
      download: "Download",
      newestFirst: "Newest First",
      oldestFirst: "Oldest First",
      numberAsc: "Number Asc",
      numberDesc: "Number Desc",
      search: "Search...",
      allStatuses: "All Statuses",
      allTime: "All Time",
      last30Days: "Last 30 Days",
      last90Days: "Last 90 Days",
      sortBy: "Sort By",
      noResultsFound: "No results found",
      offers: "Offers",
      manageOffers: "Manage your offers and quotes",
      createNewOffer: "Create New Offer",
      salesNoOffersYet: "You haven't created any offers yet.",
      createFirstOffer: "Create First Offer",
      offerDeleted: "Offer has been deleted.",
      offerDuplicated: "Offer has been duplicated.",
      duplicate: "Duplicate",
      commonErrorLoading: "Error loading data",
      commonRetry: "Retry",
    },
    de: {
      invoices: "Rechnungen",
      sales: "Verkäufe",
      settings: "Einstellungen",
      logout: "Abmelden",
      createInvoice: "Rechnung erstellen",
      saveAsDraft: "Als Entwurf speichern",
      generatePdf: "PDF generieren",
      number: "Nummer",
      date: "Datum",
      status: "Status",
      amount: "Betrag",
      actions: "Aktionen",
      confirmDelete: "Löschen bestätigen",
      confirmDeleteInvoiceMessage: "Sind Sie sicher, dass Sie diese Rechnung löschen möchten?",
      cancel: "Abbrechen",
      delete: "Löschen",
      somethingWentWrong: "Etwas ist schief gelaufen!",
      errorOccurred: "Ein unerwarteter Fehler ist aufgetreten.",
      tryAgain: "Erneut versuchen",
      goHome: "Startseite",
      errorLoadingInvoices: "Fehler beim Laden der Rechnungen",
      noInvoices: "Keine Rechnungen",
      noInvoicesMessage: "Sie haben noch keine Rechnungen erstellt.",
      refreshed: "Aktualisiert",
      invoicesRefreshed: "Rechnungen wurden aktualisiert.",
      deleted: "Gelöscht",
      invoiceDeleted: "Rechnung wurde gelöscht.",
      createInvoice: "Rechnung erstellen",
      edit: "Bearbeiten",
      download: "Herunterladen",
      newestFirst: "Neueste zuerst",
      oldestFirst: "Älteste zuerst",
      numberAsc: "Nummer Aufsteigend",
      numberDesc: "Nummer Absteigend",
      search: "Suchen...",
      allStatuses: "Alle Status",
      allTime: "Jederzeit",
      last30Days: "Letzte 30 Tage",
      last90Days: "Letzte 90 Tage",
      sortBy: "Sortieren nach",
      noResultsFound: "Keine Ergebnisse gefunden",
      offers: "Angebote",
      manageOffers: "Verwalten Sie Ihre Angebote und Kostenvoranschläge",
      createNewOffer: "Neues Angebot erstellen",
      salesNoOffersYet: "Sie haben noch keine Angebote erstellt.",
      createFirstOffer: "Erstes Angebot erstellen",
      offerDeleted: "Angebot wurde gelöscht.",
      offerDuplicated: "Angebot wurde dupliziert.",
      duplicate: "Duplizieren",
      commonErrorLoading: "Fehler beim Laden der Daten",
      commonRetry: "Wiederholen",
    },
  }

  const t = (key: string) => {
    return translations[language][key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
