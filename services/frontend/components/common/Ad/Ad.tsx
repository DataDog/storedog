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
  const [adsPath, setAdsPath] = useState<string>('')
  const adsRoutes = [
    (typeof window !== 'undefined' && (window as any).process?.env?.NEXT_PUBLIC_ADS_ROUTE) || '/services/ads',
    '/services/ads-java',
  ]

  const getRandomArbitrary = useCallback((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min)
  }, [])

  const fetchAd = useCallback(async () => {
    setLoading(true)
    const flag = (await codeStash('error-tracking', { file: config })) || false
    // Randomly select adsPath for each fetch
    const selectedAdsPath = adsRoutes[Math.random() < 0.5 ? 0 : 1]
    setAdsPath(selectedAdsPath)
    console.log(selectedAdsPath)
    const headers = {
      'X-Throw-Error': `${flag}`,
      'X-Error-Rate': process.env.NEXT_PUBLIC_ADS_ERROR_RATE || '0.25',
    }

    try {
      console.log('ads path', selectedAdsPath)
      const res = await fetch(`${selectedAdsPath}/ads`, { headers })
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
  }, [adsRoutes, getRandomArbitrary, setData, setLoading])

  useEffect(() => {
    if (!data) fetchAd()
  }, [data, fetchAd])

  if (isLoading)
    return (
      <div className="flex flex-row justify-center h-10 advertisment-wrapper">
        AD HERE
      </div>
    )
  if (!data)
    return (
      <div className="flex flex-row justify-center h-10 advertisment-wrapper">
        AD DIDN'T LOAD
      </div>
    )

  return (
    <div className="flex flex-row justify-center py-4 advertisement-wrapper">
      <picture className="advertisement-banner">
        <source srcSet={data?.path ? `${adsPath}/banners/${data.path}` : ''} type="image/webp" />
        <img src={data?.path ? `${adsPath}/banners/${data.path}` : ''} alt="Landscape picture" />
      </picture>
    </div>
  )
}

export default Ad

// Add this import for JSX types if missing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
