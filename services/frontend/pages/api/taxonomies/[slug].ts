import type { NextApiRequest, NextApiResponse } from 'next'
import { getTaxon } from '@lib/api/taxons'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const options = {
      id: req.query.slug as string,
      include: req.query.include || 'parent,taxonomy,children,image,products',
    }

    const taxon = await getTaxon(options)

    if (!taxon?.id) {
      return res.status(404).json({ error: 'Not Found' })
    }

    res.status(200).json(taxon)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
