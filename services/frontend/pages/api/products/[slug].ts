import type { NextApiRequest, NextApiResponse } from 'next'
import { getProduct } from '@lib/api/products'
import { Product } from '@customTypes/product'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const options = {
      id: req.query.slug as string,
      include:
        req.query.include ||
        'default_variant,variants,option_types,product_properties,taxons,images,primary_variant',
      ...req.query,
    }

    const product: Product = await getProduct(options)

    if (!product?.id) {
      return res.status(404).json({ error: 'Not Found' })
    }

    res.status(200).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
