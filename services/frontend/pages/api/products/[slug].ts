import type { NextApiRequest, NextApiResponse } from 'next'
import { getProduct } from '@lib/api/products'
import { Product } from '@customTypes/product'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const include =
      req.query?.includes || 'default_variant,images,primary_variant,taxons'

    const products: Product[] = await getProduct({
      include,
      page: 1,
    })

    if (products?.length === 0) {
      return res.status(404).json({ error: 'Not Found' })
    }

    res.status(200).json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
