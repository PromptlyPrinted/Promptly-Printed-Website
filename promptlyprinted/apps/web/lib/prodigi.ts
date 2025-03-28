import { env } from "@repo/env"
import { getImageSpecForSku, generateHighResImage } from "./imageSpecs"

interface ProdigiQuoteItem {
  sku: string
  copies: number
  attributes?: Record<string, any>
  assets: Array<{
    printArea: string
    url?: string
  }>
}

interface ProdigiQuoteRequest {
  shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight"
  destinationCountryCode: string
  currencyCode?: string
  items: ProdigiQuoteItem[]
}

interface ProdigiCost {
  amount: string
  currency: string
}

interface ProdigiQuoteResponse {
  outcome: string
  quotes: Array<{
    shipmentMethod: string
    costSummary: {
      items: ProdigiCost
      shipping: ProdigiCost
    }
    shipments: Array<{
      carrier: {
        name: string
        service: string
      }
      fulfillmentLocation: {
        countryCode: string
        labCode: string
      }
      cost: ProdigiCost
      items: string[]
    }>
    items: Array<{
      id: string
      sku: string
      copies: number
      unitCost: ProdigiCost
      attributes: Record<string, any>
      assets: Array<{
        printArea: string
      }>
    }>
  }>
}

interface ProdigiOrderRequest {
  shippingMethod: "Budget" | "Standard" | "Express" | "Overnight"
  recipient: {
    name: string
    email: string
    phoneNumber?: string
    address: {
      line1: string
      line2?: string
      postalOrZipCode: string
      countryCode: string
      townOrCity: string
      stateOrCounty?: string
    }
  }
  items: Array<{
    sku: string
    copies: number
    merchantReference?: string
    sizing?: "fillPrintArea" | "fitPrintArea"
    assets: Array<{
      printArea: string
      url: string
    }>
  }>
  merchantReference?: string
  idempotencyKey?: string
  callbackUrl?: string
  metadata?: Record<string, any>
}

interface ProdigiOrderItem {
  sku: string
  copies: number
  artworkUrl: string // URL to the original artwork
  mockupUrl: string  // URL to the mockup image (for display only)
}

class ProdigiService {
  private apiKey: string
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.apiKey = env.PRODIGI_API_KEY
    this.baseUrl = env.PRODIGI_API_URL || "https://api.sandbox.prodigi.com/v4.0"
    this.headers = {
      "X-API-Key": this.apiKey,
      "Content-Type": "application/json"
    }
  }

  private async prepareItemWithHighResImage(item: ProdigiOrderItem) {
    const spec = getImageSpecForSku(item.sku)
    if (!spec) {
      throw new Error(`No image specifications found for SKU: ${item.sku}`)
    }

    // Generate high-res version of the artwork (not the mockup)
    const highResUrl = await generateHighResImage(item.artworkUrl, spec)

    return {
      sku: item.sku,
      copies: item.copies,
      assets: [{
        printArea: "default",
        url: highResUrl
      }]
    }
  }

  async getQuote(request: ProdigiQuoteRequest): Promise<ProdigiQuoteResponse> {
    const response = await fetch(`${this.baseUrl}/quotes`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`)
    }

    return response.json()
  }

  async createOrder(request: ProdigiOrderRequest) {
    // Ensure all items have artwork URLs
    const items = await Promise.all(request.items.map(async item => {
      if (!item.assets[0]?.url) {
        throw new Error(`Missing artwork URL for SKU: ${item.sku}`)
      }
      return {
        ...item,
        sizing: item.sizing || "fillPrintArea"
      }
    }))

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        ...this.headers,
        ...(request.idempotencyKey && { "Idempotency-Key": request.idempotencyKey })
      },
      body: JSON.stringify({
        ...request,
        items,
        callbackUrl: request.callbackUrl || process.env.NEXT_PUBLIC_PRODIGI_WEBHOOK_URL
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to create order: ${response.statusText}${
        errorData ? ` - ${JSON.stringify(errorData)}` : ''
      }`)
    }

    return response.json()
  }

  async getOrder(prodigiOrderId: string) {
    const response = await fetch(`${this.baseUrl}/orders/${prodigiOrderId}`, {
      method: "GET",
      headers: this.headers
    })

    if (!response.ok) {
      throw new Error(`Failed to get order: ${response.statusText}`)
    }

    return response.json()
  }

  async updateRecipient(prodigiOrderId: string, recipient: ProdigiOrderRequest["recipient"]) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/updateRecipient`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ recipient })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update recipient: ${response.statusText}`)
    }

    return response.json()
  }

  async cancelOrder(prodigiOrderId: string) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/cancel`,
      {
        method: "POST",
        headers: this.headers
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`)
    }

    return response.json()
  }

  async updateShippingMethod(prodigiOrderId: string, shippingMethod: string) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/updateShippingMethod`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ shippingMethod })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update shipping method: ${response.statusText}`)
    }

    return response.json()
  }
}

// Create a singleton instance
export const prodigiService = new ProdigiService() 