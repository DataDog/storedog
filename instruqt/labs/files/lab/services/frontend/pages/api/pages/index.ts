import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages } from '@lib/api/pages'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (config && config.length > 0) {
    const isError = await codeStash('api-errors', { file: config })

    if (isError) {
      const random = Math.random()
      if (random < 0.33) {
        return res.status(400).json({ message: 'Bad request' })
      } else if (random < 0.66) {
        return res.status(500).json({ message: 'Internal server error' })
      }
    }
  }

  const pages = await getPages()
  res.status(200).json(pages)
}
