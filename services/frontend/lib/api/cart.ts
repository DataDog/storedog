import fetch from 'node-fetch'
import { Cart } from '@customTypes/cart'

const SPREE_URL_CLIENTSIDE = 'http://localhost:4000/api/v2'

// CART API
interface CartOptionsBase {
  bearer_token?: string
  order_token?: string
  [key: string]: any
}

export const formatCart = (cartApi: any): Cart => {
  const cart: Cart = {
    createdAt: cartApi.data.attributes.created_at,
    currency: {
      code: cartApi.data.attributes.currency,
    },
    customerId: cartApi.data.attributes.token,
    discounts: [],
    email: cartApi.data.attributes.email,
    id: cartApi.data.id,
    subtotalPrice: Number(cartApi.data.attributes.item_total),
    lineItemsSubtotalPrice: Number(cartApi.data.attributes.item_total),
    taxesIncluded: false,
    shipTotal: Number(cartApi.data.attributes.ship_total),
    totalPrice: Number(cartApi.data.attributes.total),
    lineItems: cartApi.data.relationships.line_items.data.map(
      (lineItem: any) => {
        const lineItemData = cartApi.included.find(
          (i: any) => i.id === lineItem.id && i.type === lineItem.type
        )

        // get selected line item variant
        const variant = cartApi.included.find((i: any) => {
          return (
            i.id === lineItemData.relationships.variant.data.id &&
            i.type === 'variant'
          )
        })

        return {
          id: lineItemData.id,
          quantity: lineItemData.attributes.quantity,
          variantId: lineItemData.relationships.variant.data.id,
          name: lineItemData.attributes.name,
          path: lineItemData.attributes.slug,
          productId: lineItemData.attributes.product_id,
          discounts: [],
          variant: {
            id: variant.attributes.variant_id,
            sku: variant.attributes.sku,
            name: variant.attributes.name,
            price: Number(variant.attributes.price),
            requiresShipping: false,
            availableForSale: true,
            listPrice: Number(variant.attributes.price),
            isInStock: true,
            image: variant.relationships.images.data.map((image: any) => {
              // find relationship data in included
              const imageData = cartApi.included.find(
                (i: any) => i.id === image.id && i.type === image.type
              )

              return {
                url: `http://localhost:4000/${imageData.attributes.original_url}`,
                alt: imageData.attributes.alt,
              }
            })[0],
          },
        }
      }
    ),
  }
  return cart
}

export const createCart = async (
  options: CartOptionsBase
): Promise<Cart | any> => {
  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart?include=${encodeURIComponent(
      options.include
    )}`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!res.ok) {
      throw res
    }

    const cartApi = await res.json()

    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}

export const getCart = async (
  options: CartOptionsBase
): Promise<Cart | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }

  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart?include=${encodeURIComponent(
      options.include
    )}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!res.ok) {
      throw res
    }

    const cartApi = await res.json()

    const cart = formatCart(cartApi)

    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}

export const emptyCart = async (
  options: CartOptionsBase
): Promise<Cart | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }

  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart/empty?include=${encodeURIComponent(
      options.include
    )}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!res.ok) {
      throw res
    }

    const cartApi = await res.json()
    const cart = formatCart(cartApi)

    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}

export const deleteCart = async (
  options: CartOptionsBase
): Promise<boolean | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }

  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!res.ok) {
      throw res
    }

    // if successful deletion, no response is returned
    return true
  } catch (error) {
    console.log(error)
    return error
  }
}

// Adding items to the cart
export interface CartAddItems extends CartOptionsBase {
  variant_id: string
  quantity: number
}

export const addToCart = async (options: CartAddItems): Promise<Cart | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }

  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart/add_item?include=${encodeURIComponent(
      options.include
    )}`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
      body: JSON.stringify({
        variant_id: options.variant_id,
        quantity: options.quantity,
      }),
    })

    if (!res.ok) {
      console.log('error')
      throw res
    }

    const cartApi = await res.json()

    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    const errorResponse = await error.json()
    return errorResponse
  }
}

// Removing items from the cart
export interface CartRemoveItems extends CartOptionsBase {
  // line_item_id (but they call it `id` here for some reason)
  id: string
}

export const removeFromCart = async (
  options: CartRemoveItems
): Promise<Cart | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }
  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart/remove_line_item/${
      options.id
    }?include=${encodeURIComponent(options.include)}`

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
    })

    if (!res.ok) {
      throw res
    }

    const cartApi: any = await res.json()

    // remove deleted line item from cart before formatting because apparently they don't know how to do that?
    cartApi.data.relationships.line_items.data =
      cartApi.data.relationships.line_items.data.filter(
        (lineItem: any) => lineItem.id !== options.id
      )
    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}

// Updating items in the cart
export interface CartQuantityUpdate extends CartOptionsBase {
  line_item_id: string
  quantity: number
}

export const updateQuantity = async (
  options: CartQuantityUpdate
): Promise<Cart | any> => {
  if (!options.order_token && !options.bearer_token) {
    return new Error('You must provide either an order_token or a bearer_token')
  }

  try {
    const url = `${SPREE_URL_CLIENTSIDE}/storefront/cart/set_quantity?include=${encodeURIComponent(
      options.include
    )}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Spree-Order-Token': options.order_token || '',
      },
      body: JSON.stringify({
        line_item_id: options.line_item_id,
        quantity: options.quantity,
      }),
    })

    if (!res.ok) {
      throw res
    }

    const cartApi = await res.json()
    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}
