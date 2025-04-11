export type SubscriptionCallback<T> = (payload: T) => void
export type SubscriptionCleanup = () => void

// Subscribe to changes in a table
export const subscribeToTable = <T>(
  table: string,
  callback: SubscriptionCallback<T>,
  filter?: {\
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    schema?: string,
    filter?: string
  }
): SubscriptionCleanup => {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: filter?.event || '*',
        schema: filter?.schema || 'public',
        table,
        filter: filter?.filter
      },
      (payload) => {
        callback(payload.new as T)
      }
    )
    .subscribe()
  
  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}

// Subscribe to changes in a specific record
export const subscribeToRecord = <T>(
  table: string,
  recordId: string,
  callback: SubscriptionCallback<T>
): SubscriptionCleanup => {
  return subscribeToTable<T>(
    table,
    callback,
    {
      event: 'UPDATE',
      filter: `id=eq.${recordId}`
    }
  )
}

// Subscribe to changes in records belonging to a business
export const subscribeToBusinessRecords = <T>(
  table: string,
  businessId: string,
  callback: SubscriptionCallback<T>
): SubscriptionCleanup => {
  return subscribeToTable<T>(
    table,
    callback,
    {
      filter: `business_id=eq.${businessId}`
    }
  )
}

// Subscribe to invoice status changes
export const subscribeToInvoiceStatusChanges = (
  invoiceId: string,
  callback: (status: string) => void
): SubscriptionCleanup => {
  const subscription = supabase
    .channel(`invoice-${invoiceId}-status`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: `id=eq.${invoiceId}`
      },
      (payload) => {
        if (payload.new && payload.new.status) {
          callback(payload.new.status)
        }
      }
    )
    .subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}
