import { useState, useEffect, useCallback } from 'react'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

const AD_PLACEMENT = 'homepage'

export interface AdDataResults {
  id: number
  name: string
  path: string
  url?: string
  weight?: number
}
// Advertisement banner
function Ad() {
  const [data, setData] = useState<AdDataResults | null>(null)
  const [isLoading, setLoading] = useState(false)
  const adsPath = process.env.NEXT_PUBLIC_ADS_ROUTE || `/services/ads`

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
      const res = await fetch(`${adsPath}/ads/serve?placement=${AD_PLACEMENT}`, { headers })
      if (!res.ok) {
        throw new Error('Error fetching ad')
      }
      const data = await res.json()
      console.log(data)
      setData(data)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }, [adsPath, setData, setLoading])

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
      <a href={`${adsPath}/ads/${data.id}/click?placement=${AD_PLACEMENT}`} aria-label={data.name}>
        <picture className="advertisement-banner">
          <source
            srcSet={`${adsPath}/banners/${data.path}?placement=${AD_PLACEMENT}`}
            type="image/jpeg"
          />
          <img src={`${adsPath}/banners/${data.path}?placement=${AD_PLACEMENT}`} alt={data.name} />
        </picture>
      </a>
    </div>
  )
}

export default Ad
