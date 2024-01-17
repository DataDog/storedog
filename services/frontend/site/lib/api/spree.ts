const createFetchFetcher =
  require('@spree/node-fetcher/dist/server/index').default
const { makeClient } = require('@spree/storefront-api-v2-sdk')
import { Product } from '@customTypes/product'
import { Page } from '@customTypes/page'
import { Cart } from '@customTypes/cart'

const spreeServerSide = makeClient({
  host: process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://web:4000',
  createFetcher: createFetchFetcher,
})

const spreeClientSide = makeClient({
  host: 'http://localhost:4000',
  createFetcher: createFetchFetcher,
})

const spreeGet = async (
  resource: string,
  operation: string,
  options: any = {}
): Promise<any> => {
  try {
    const res = await spreeServerSide[resource][operation](options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const data = await res.success()
    return data
  } catch (error) {
    console.log(error)
    return error
  }
}

//  GET CONTENT API
export const getProducts = async (
  options: any = {}
): Promise<Product[] | any> => {
  try {
    const productsApi = await spreeGet('products', 'list', options)

    const products: Product[] = productsApi.data.map((product: any) => {
      const id = product.id
      const name = product.attributes.name
      const description = product.attributes.description
      const descriptionHtml = product.attributes.description
      const slug = product.attributes.slug
      const sku = product.attributes.sku
      const price = {
        value: Number(product.attributes.price),
        retailPrice: Number(product.attributes.price),
        currencyCode: product.attributes.currency,
      }
      const path = product.attributes.slug
      const images = product.relationships.images.data.map((image: any) => {
        // find relationship data in included
        const imageData = productsApi.included.find(
          (i: any) => i.id === image.id && i.type === image.type
        )

        return {
          url: `${process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://web:4000'}${
            imageData.attributes.original_url
          }`,
          alt: imageData.attributes.alt,
        }
      })

      return {
        id,
        name,
        description,
        descriptionHtml,
        slug,
        sku,
        price,
        path,
        images,
      }
    })

    return products
  } catch (error) {
    console.log(error)
    return error
  }
}

export const getProduct = async (options: any): Promise<Product | any> => {
  try {
    const res = await spreeGet('products', 'show', options)

    const product: Product = {
      id: res.data.id,
      name: res.data.attributes.name,
      description: res.data.attributes.description,
      descriptionHtml: res.data.attributes.description,
      slug: res.data.attributes.slug,
      sku: res.data.attributes.sku,
      path: res.data.attributes.slug,
      price: {
        value: Number(res.data.attributes.price),
        retailPrice: Number(res.data.attributes.price),
        currencyCode: res.data.attributes.currency,
      },
      images: res.data.relationships.images.data.map((image: any) => {
        // find relationship data in included
        const imageData = res.included.find(
          (i: any) => i.id === image.id && i.type === image.type
        )

        return {
          url: `${process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://web:4000'}${
            imageData.attributes.original_url
          }`,
          alt: imageData.attributes.alt,
        }
      }),
    }

    const defaultVariant = res.included.reduce((acc: any, i: any) => {
      if (
        i.type !== 'variant' ||
        i.id !== res.data.relationships.default_variant.data.id
      ) {
        return acc
      }

      acc.id = i.id
      acc.availableforSale = i.attributes.purchasable
      acc.options = [
        {
          id: i.id,
          displayName: 'Options',
          values: [
            {
              label: 'Default',
              hexColors: [],
            },
          ],
        },
      ]
      return acc
    }, {})

    // set up for only one variant for now
    product.variants = [defaultVariant]

    return product
  } catch (error) {
    console.log(error)
    return error
  }
}

export const getPages = async (options: any = {}): Promise<Page[] | any> => {
  try {
    const res = await spreeGet('pages', 'list', options)

    const pages: Page[] = res.data.map((page: any) => {
      const id = page.id
      const name = page.attributes.title
      const url = `/${page.attributes.slug || ''}`

      return {
        id,
        name,
        url,
      }
    })

    return pages
  } catch (error) {
    console.log(error)
    return error
  }
}

export const getTaxons = async (options: any = {}) => {
  try {
    const res = await spreeClient.taxons.list(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const taxons = await res.success()
    return taxons
  } catch (error) {
    console.log(error)
    return error
  }
}

// CART API

// Setting up the cart
interface CartOptionsBase {
  bearer_token?: string
  order_token?: string
  [key: string]: any
}

const formatCart = (cartApi: any): Cart => {
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
                url: `${
                  process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://web:4000'
                }${imageData.attributes.original_url}`,
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
    const res = await spreeClientSide.cart.create(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()
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
    const res = await spreeClientSide.cart.show(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()

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
    const res = await spreeClientSide.cart.emptyCart(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()

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
    const res = await spreeClientSide.cart.remove(options)

    if (!res.isSuccess()) {
      throw res.fail()
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
    const res = await spreeClientSide.cart.addItem(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()
    console.log('cartApi from addToCart', cartApi)
    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    console.log(error)
    return error
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
    const res = await spreeClientSide.cart.removeItem(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()
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
    const res = await spreeClientSide.cart.setQuantity(options)

    if (!res.isSuccess()) {
      throw res.fail()
    }

    const cartApi = await res.success()
    const cart = formatCart(cartApi)
    return cart
  } catch (error) {
    console.log(error)
    return error
  }
}

export default spreeClientSide
