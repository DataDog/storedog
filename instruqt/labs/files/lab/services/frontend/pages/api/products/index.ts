import type { NextApiRequest, NextApiResponse } from 'next'
import { getProducts } from '@lib/api/products'
import { Product } from '@customTypes/product'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const options = {
      include:
        req.query?.includes || 'default_variant,images,primary_variant,taxons',
      page: req.query.page || 1,
      per_page: req.query.per_page || 25,
      ...req.query,
    }

    const products: Product[] = await getProducts(options)

    if (products?.length === 0) {
      return res.status(404).json({ error: 'No products found' })
    }

    res.status(200).json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
