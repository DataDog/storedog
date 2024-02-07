import type { NextApiRequest, NextApiResponse } from 'next'
import { getPage } from '@lib/api/pages'

// This is the handler for the /api/pages/[slug] route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req)
  console.log(req.query)
  // Get the slug from the URL
  const { slug } = req.query
  // Get the page data from the API
  const page = await getPage(slug as string)
  // Return the page data as JSON
  res.status(200).json(page)
}
