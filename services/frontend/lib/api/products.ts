import fetch from 'node-fetch'
import { Product } from '@customTypes/product'

const SPREE_URL_SERVERSIDE = process.env.NEXT_PUBLIC_SPREE_API_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_API_HOST}/api/v2`
  : 'http://nginx/services/backend/api/v2'

//  GET CONTENT API
export const getProducts = async (
  options: any = {}
): Promise<Product[] | any> => {
  try {
    const url = `${SPREE_URL_SERVERSIDE}/storefront/products?include=${encodeURIComponent(
      options.include
    )}&page=${options.page || 1}&per_page=${
      options.per_page || 25
    }&filter[taxons]=${encodeURIComponent(options.taxons)}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw res
    }

    const productsApi: any = await res.json()

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
          url: `${
            process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://backend:4000'
          }${imageData.attributes.original_url}`,
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
    const url = `${SPREE_URL_SERVERSIDE}/storefront/products/${
      options.id
    }?include=${encodeURIComponent(options.include)}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw res
    }

    const productApi: any = await res.json()

    console.log('PRODUCT API RETURN')
    console.log(productApi)

    const product: Product = {
      id: productApi.data.id,
      name: productApi.data.attributes.name,
      description: productApi.data.attributes.description,
      descriptionHtml: productApi.data.attributes.description,
      slug: productApi.data.attributes.slug,
      sku: productApi.data.attributes.sku,
      path: productApi.data.attributes.slug,
      price: {
        value: Number(productApi.data.attributes.price),
        retailPrice: Number(productApi.data.attributes.price),
        currencyCode: productApi.data.attributes.currency,
      },
      images: productApi.data.relationships.images.data.map((image: any) => {
        // find relationship data in included
        const imageData = productApi.included.find(
          (i: any) => i.id === image.id && i.type === image.type
        )

        return {
          url: `${
            process.env.NEXT_PUBLIC_SPREE_API_HOST || 'http://backend:4000'
          }${imageData.attributes.original_url}`,
          alt: imageData.attributes.alt,
        }
      }),
    }

    const defaultVariant = productApi.included.reduce((acc: any, i: any) => {
      if (
        i.type !== 'variant' ||
        i.id !== productApi.data.relationships.default_variant.data.id
      ) {
        return acc
      }

      acc.id = i.id
      acc.availableForSale = i.attributes.purchasable
      acc.attributes = {
        name: i.attributes.options_text,
        inStock: i.attributes.in_stock,
        price: i.attributes.price,
        depth: i.attributes.depth,
        width: i.attributes.width,
        height: i.attributes.height,
        weight: i.attributes.weight,
      }
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

    const otherVariants = productApi.included.reduce((acc: any, i: any) => {
      if (
        i.type !== 'variant' ||
        i.id === productApi.data.relationships.default_variant.data.id
      ) {
        return acc
      }

      acc.push({
        id: i.id,
        availableForSale: i.attributes.purchasable,
        attributes: {
          name: i.attributes.options_text,
          inStock: i.attributes.in_stock,
          price: i.attributes.price,
          depth: i.attributes.depth,
          width: i.attributes.width,
          height: i.attributes.height,
          weight: i.attributes.weight,
        },
        options: [
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
        ],
      })

      return acc
    }, [])

    // set up for only one variant for now
    product.variants = [defaultVariant, ...otherVariants]

    return product
  } catch (error) {
    console.log(error)
    return error
  }
}
