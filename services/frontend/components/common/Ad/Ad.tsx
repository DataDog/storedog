import { useState, useEffect, useCallback } from 'react'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

// Proper TypeScript interface for Advertisement object from Java service
export interface Advertisement {
  id: number
  name: string
  path: string
  clickUrl: string
}

// Advertisement banner
function Ad() {
  const [data, setData] = useState<Advertisement | null>(null)
  const [isLoading, setLoading] = useState(false)
  const adsPath = process.env.NEXT_PUBLIC_ADS_ROUTE || `/services/ads`

  const getRandomArbitrary = useCallback((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min)
  }, [])

  const fetchAd = useCallback(async () => {
    setLoading(true)
    const flag = (await codeStash('error-tracking', { file: config })) || false
    console.log(adsPath)
    const headers = {
      'X-Throw-Error': `${flag}`,
      'X-Error-Rate': process.env.NEXT_PUBLIC_ADS_ERROR_RATE || '0.25',
    }

    try {
      console.log('ads path', adsPath)
      const res = await fetch(`${adsPath}/ads`, { headers })
      if (!res.ok) {
        throw new Error('Error fetching ad')
      }
      const data: Advertisement[] = await res.json()
      console.log(data)
      const index = getRandomArbitrary(0, data.length)
      setData(data[index])
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }, [adsPath, getRandomArbitrary, setData, setLoading])

  const handleAdClick = useCallback(() => {
    if (data?.id) {
      // Direct browser navigation to the click endpoint
      // The Java service will handle the redirect to the appropriate URL
      window.location.href = `${adsPath}/click/${data.id}`
    }
  }, [data, adsPath])

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
      <picture 
        className="advertisement-banner cursor-pointer" 
        onClick={handleAdClick}
        title={`Click to see ${data.name}`}
      >
        <source srcSet={`${adsPath}/banners/${data.path}`} type="image/webp" />
        <img 
          src={`${adsPath}/banners/${data.path}`} 
          alt={data.name || "Advertisement"} 
          className="cursor-pointer"
        />
      </picture>
    </div>
  )
}

export default Ad
