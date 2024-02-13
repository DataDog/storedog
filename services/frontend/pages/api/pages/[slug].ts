import type { NextApiRequest, NextApiResponse } from 'next'
import { codeStash } from 'code-stash'
import { getPage } from '@lib/api/pages'
import config from '../../../featureFlags.config.json'

// This is the handler for the /api/pages/[slug] route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if flag is thrown, throw 400 or 500 errors at random, but make sure most of the time it's 200
  if (config && config.length > 0) {
    const isError = await codeStash('api-errors', { file: config })

    if (isError) {
      const random = Math.random()
      if (random < 0.25) {
        return res.status(400).json({ message: 'Bad request' })
      } else if (random < 0.5) {
        return res.status(500).json({ message: 'Internal server error' })
      }
    }
  }

  // Get the slug from the URL
  const { slug } = req.query
  // Get the page data from the API
  const page = await getPage(slug as string)

  if (!page.id) {
    // If the page doesn't exist, return a 404
    return res.status(404).json({ message: 'Page not found' })
  }

  // Return the page data as JSON
  res.status(200).json(page)
}
