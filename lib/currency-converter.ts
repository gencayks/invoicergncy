// Exchange rate API interface
interface ExchangeRateResponse {
  success: boolean
  timestamp: number
  base: string
  date: string
  rates: Record<string, number>
}

// Cache for exchange rates to minimize API calls
let ratesCache: {
  timestamp: number
  base: string
  rates: Record<string, number>
} | null = null

// Cache expiration time (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000

export async function fetchExchangeRates(baseCurrency = "USD"): Promise<Record<string, number>> {
  // Check if we have valid cached rates
  if (ratesCache && ratesCache.base === baseCurrency && Date.now() - ratesCache.timestamp < CACHE_EXPIRATION) {
    return ratesCache.rates
  }

  try {
    // In a real application, you would use an API key
    // This is a placeholder for demonstration purposes
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates")
    }

    const data: ExchangeRateResponse = await response.json()

    // Update cache
    ratesCache = {
      timestamp: Date.now(),
      base: baseCurrency,
      rates: data.rates,
    }

    return data.rates
  } catch (error) {
    console.error("Error fetching exchange rates:", error)

    // Return some default rates if API fails
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.75,
      CAD: 1.25,
      AUD: 1.35,
      JPY: 110.0,
    }
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount

  // If rates don't include the currencies, return original amount
  if (!rates[fromCurrency] || !rates[toCurrency]) return amount

  // Convert to base currency first (if not already base), then to target currency
  const baseAmount = fromCurrency === "USD" ? amount : amount / rates[fromCurrency]
  return baseAmount * rates[toCurrency]
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}
