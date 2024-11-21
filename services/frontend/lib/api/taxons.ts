import fetch from 'node-fetch'
import type { Taxon } from '@customTypes/taxons'

const SPREE_URL_SERVERSIDE = process.env.NEXT_PUBLIC_SPREE_API_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_API_HOST}/api/v2`
  : 'http://backend:4000/api/v2'

//  get taxons
export const getTaxons = async (options: any = {}): Promise<Taxon[] | any> => {
  try {
    const url = `${SPREE_URL_SERVERSIDE}/storefront/taxons?include=${encodeURIComponent(
      options.include || ''
    )}&page=${options.page || 1}&per_page=${options.per_page || 25}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw res
    }

    const taxonsApi: any = await res.json()
    // build object of parent taxons with children
    const taxonsObj: any = taxonsApi.data.reduce((acc: any, taxon: any) => {
      if (taxon.relationships.parent.data === null) {
        const key = taxon.attributes.name.toLowerCase()
        const id = taxon.id
        const children = taxonsApi.data.filter(
          (taxon: any) =>
            taxon.relationships.parent.data !== null &&
            taxon.relationships.parent.data.id === id
        )
        acc[key] = { ...taxon, children }
        return acc
      }
      return acc
    }, {})

    return taxonsObj
  } catch (error) {
    console.log(error)
    return error
  }
}

// get taxon
export const getTaxon = async (options: any = {}): Promise<Taxon | any> => {
  try {
    const url = `${SPREE_URL_SERVERSIDE}/storefront/taxons/${
      options.id
    }?include=${encodeURIComponent(options.include || '')}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw res
    }

    const taxonApi = await res.json()

    const taxonsObj: Taxon = {
      id: taxonApi.data.id,
      type: taxonApi.data.type,
      attributes: {
        name: taxonApi.data.attributes.name,
        pretty_name: taxonApi.data.attributes.pretty_name,
        permalink: taxonApi.data.attributes.permalink,
      },
      children: taxonApi.included
        .filter((taxon: any) => taxon.type === 'taxon')
        .map((taxon: any) => {
          return {
            id: taxon.id,
            name: taxon.attributes.name,
            pretty_name: taxon.attributes.pretty_name,
            permalink: taxon.attributes.permalink,
          }
        }),
      image: taxonApi.included.find(
        (taxon: any) => taxon.type === 'taxon_image'
      ),
      products: taxonApi.included
        .filter((taxon: any) => taxon.type === 'product')
        .map((product: any) => product.id),
    }

    return taxonsObj
  } catch (error) {
    console.log(error)
    return error
  }
}
