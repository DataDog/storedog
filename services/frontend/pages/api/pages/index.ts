import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages } from '@lib/api/pages'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pages = await getPages()
  res.status(200).json(pages)
}
