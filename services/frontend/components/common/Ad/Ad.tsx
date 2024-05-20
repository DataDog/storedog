import { useState, useEffect, useCallback } from 'react'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

export interface AdDataResults {
  data: object | null
  path: string
}
// Advertisement banner
function Ad() {
  const [data, setData] = useState<AdDataResults | null>(null)
  const [isLoading, setLoading] = useState(false)
  const adsPath =
    `${process.env.NEXT_PUBLIC_ADS_URL_FULL}` ||
    `${process.env.NEXT_PUBLIC_ADS_ROUTE}:${process.env.NEXT_PUBLIC_ADS_PORT}`

  const getRandomArbitrary = useCallback((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min)
  }, [])

  const fetchAd = useCallback(async () => {
    setLoading(true)
    const flag = (await codeStash('error-tracking', { file: config })) || false

    const headers = {
      'X-Throw-Error': `${flag}`,
      'X-Error-Rate': process.env.NEXT_PUBLIC_ADS_ERROR_RATE || '0.25',
    }

    try {
      const res = await fetch(`${adsPath}/ads`, { headers })
      if (!res.ok) {
        throw new Error('Error fetching ad')
      }
      const data = await res.json()
      console.log(data)
      const index = getRandomArbitrary(0, data.length)
      setData(data[index])
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }, [adsPath, getRandomArbitrary, setData, setLoading])

  useEffect(() => {
    if (!data) fetchAd()
  }, [data, fetchAd])

  if (isLoading)
    return <div className="flex flex-row justify-center h-10">AD HERE</div>
  if (!data)
    return (
      <div className="flex flex-row justify-center h-10">AD DIDN'T LOAD</div>
    )

  return (
    <div className="flex flex-row justify-center py-4">
      <picture>
        <source srcSet={`${adsPath}/banners/${data.path}`} type="image/webp" />
        <img src={`${adsPath}/banners/${data.path}`} alt="Landscape picture" />
      </picture>
    </div>
  )
}

export default Ad
