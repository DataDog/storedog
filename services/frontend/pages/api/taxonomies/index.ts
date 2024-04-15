import type { NextApiRequest, NextApiResponse } from 'next'
import { getTaxons } from '@lib/api/taxons'
import { Taxon } from '@customTypes/taxons'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const options = {
      include: req.query?.includes || 'parent,taxonomy,children,image,products',
      page: req.query.page || 1,
      per_page: req.query.per_page || 25,
    }

    const taxons: Taxon[] = await getTaxons(options)

    if (taxons?.length === 0) {
      return res.status(404).json({ error: 'Not Found' })
    }

    res.status(200).json(taxons)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
