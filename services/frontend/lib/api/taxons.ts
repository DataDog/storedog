import fetch from 'node-fetch'
import type { Taxon } from '@customTypes/taxons'

const SPREE_URL_SERVERSIDE = process.env.NEXT_PUBLIC_SPREE_API_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_API_HOST}/api/v2`
  : 'http://web:4000/api/v2'

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
