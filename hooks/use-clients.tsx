"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { getBusinessClients, getClient, createClient, updateClient, deleteClient } from "@/lib/client-service"
import { useBusiness } from "./use-business"
import type { ClientData } from "@/lib/client-service"

type ClientContextType = {
  clients: any[]
  currentClient: any | null
  isLoading: boolean
  error: Error | null
  setCurrentClient: (client: any) => void
  createNewClient: (clientData: ClientData) => Promise<any>
  updateCurrentClient: (updates: Partial<ClientData>) => Promise<any>
  deleteCurrentClient: () => Promise<boolean>
  refreshClients: () => Promise<void>
  loadClient: (clientId: string) => Promise<any>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { currentBusiness } = useBusiness()
  const [clients, setClients] = useState<any[]>([])
  const [currentClient, setCurrentClient] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadClients = async () => {
    if (!currentBusiness) {
      setClients([])
      setCurrentClient(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { clients, error } = await getBusinessClients(currentBusiness.id)

      if (error) throw error

      setClients(clients)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [currentBusiness])

  const refreshClients = async () => {
    await loadClients()
  }

  const loadClient = async (clientId: string) => {
    if (!currentBusiness) throw new Error("No business selected")

    try {
      setIsLoading(true)
      const { client, error } = await getClient(clientId, currentBusiness.id)

      if (error) throw error

      setCurrentClient(client)
      return client
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createNewClient = async (clientData: ClientData) => {
    if (!currentBusiness) throw new Error("No business selected")

    try {
      const { client, error } = await createClient(currentBusiness.id, clientData)

      if (error) throw error

      await refreshClients()
      return client
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateCurrentClient = async (updates: Partial<ClientData>) => {
    if (!currentClient || !currentBusiness) throw new Error("No client selected or no business selected")

    try {
      const { client, error } = await updateClient(currentClient.id, updates, currentBusiness.id)

      if (error) throw error

      setCurrentClient(client)
      await refreshClients()
      return client
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteCurrentClient = async () => {
    if (!currentClient || !currentBusiness) throw new Error("No client selected or no business selected")

    try {
      const { error } = await deleteClient(currentClient.id, currentBusiness.id)

      if (error) throw error

      setCurrentClient(null)
      await refreshClients()
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const value = {
    clients,
    currentClient,
    isLoading,
    error,
    setCurrentClient,
    createNewClient,
    updateCurrentClient,
    deleteCurrentClient,
    refreshClients,
    loadClient,
  }

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export const useClients = () => {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error("useClients must be used within a ClientProvider")
  }
  return context
}
