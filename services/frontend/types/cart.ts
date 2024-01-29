export type CartLineItem = {
  id: string
  quantity: number
  variantId: string
  name: string
  path: string
  productId: string
  discounts: []
  variant: {
    id: string
    sku: string
    name: string
    price: number
    requiresShipping: boolean
    availableForSale: boolean
    listPrice: number
    isInStock: boolean
    image: {
      url: string
      alt: string
    }
  }
}

export type Cart = {
  createdAt: string
  currency: {
    code: string
  }
  customerId: string
  discounts: []
  email: string | null
  id: string
  lineItems: CartLineItem[] | []
  lineItemsSubtotalPrice: number
  subtotalPrice: number
  taxesIncluded: boolean
  totalPrice: number
}
