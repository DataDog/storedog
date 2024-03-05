import fetch from 'node-fetch'
import { formatCart } from '@lib/api/cart'
import { CheckoutBase, UpdateCheckout } from '@customTypes/checkout'

const SPREE_URL_CLIENTSIDE = process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST}/api/v2`
  : 'http://localhost:4000/api/v2'

// use this to select payment method (will usually be `1` for credit card bogus gateway)
export const listPaymentMethods = async (
  options: CheckoutBase
): Promise<any> => {
  const url = `${SPREE_URL_CLIENTSIDE}/storefront/checkout/payment_methods`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const paymentMethods = await response.json()
    return paymentMethods
  } catch (error) {
    console.error(error)
    return error
  }
}

// run this AFTER user has entered shipping details
export const listShippingRates = async (
  options: CheckoutBase
): Promise<any> => {
  const url = `${SPREE_URL_CLIENTSIDE}/storefront/checkout/shipping_rates`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const shippingRates = await response.json()
    return shippingRates
  } catch (error) {
    console.error(error)
    return error
  }
}

export const updateCheckout = async (options: UpdateCheckout): Promise<any> => {
  const url = `${SPREE_URL_CLIENTSIDE}/storefront/checkout?include=${encodeURI(
    'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
  )}`

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'X-Spree-Order-Token': options.order_token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw response
    }

    const updatedCart = await response.json()
    // format cart
    const cart = formatCart(updatedCart)
    return cart
  } catch (error) {
    const errorMessage = await error.json()
    console.error(errorMessage.error)
    return errorMessage
  }
}

export const completeCheckout = async (options: CheckoutBase): Promise<any> => {
  const url = `${SPREE_URL_CLIENTSIDE}/storefront/checkout/complete?include=${encodeURI(
    'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'
  )}`

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!response.ok) {
      throw response
    }

    const checkout = await response.json()
    const cart = formatCart(checkout)
    return cart
  } catch (error) {
    const errorMessage = await error.json()
    console.error(error)
    return errorMessage
  }
}
