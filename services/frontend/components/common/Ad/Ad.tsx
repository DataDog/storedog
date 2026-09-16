import { useState, useEffect, useCallback } from 'react'
import { datadogRum } from '@datadog/browser-rum'

export interface AdDataResults {
  data: object | null
  path: string
  name: string
}

// Measures time-to-visible-ad: fetch + render + banner image download. The
// Layout renders an <Ad /> with no id, so the slot falls back to 'bottom-ad'.
const VITAL_NAME = 'ad.banner_load'

// Advertisement banner
function Ad({ id }: { id: string }) {
  const [data, setData] = useState<AdDataResults | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [adContainerId, setAdContainerId] = useState<string | null>(null)
  const adsPath = process.env.NEXT_PUBLIC_ADS_ROUTE || `/services/ads`
  const slot = id || 'bottom-ad'

  const getRandomArbitrary = useCallback((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min)
  }, [])

  // Several ads mount at once on the home page, so each needs its own vitalKey.
  const stopAdVital = useCallback(
    (outcome: 'success' | 'image_error') => {
      datadogRum.stopDurationVital(VITAL_NAME, {
        vitalKey: slot,
        context: { outcome, ad_name: data?.name, ad_path: data?.path },
      })
    },
    [slot, data]
  )

  const fetchAd = useCallback(async () => {
    setLoading(true)

    datadogRum.startDurationVital(VITAL_NAME, {
      vitalKey: slot,
      description: slot,
      context: { ad_slot: slot },
    })

    switch (id) {
      case 'first-ad':
        setAdContainerId('first-ad-container')
        break
      case 'second-ad':
        setAdContainerId('second-ad-container')
        break
      default:
        setAdContainerId('bottom-ad-container')
    }

    try {
      const res = await fetch(`${adsPath}/ads`)
      if (!res.ok) {
        throw new Error('Error fetching ad')
      }
      const ads = await res.json()
      const index = getRandomArbitrary(0, ads.length)
      setData(ads[index])
      setLoading(false)
    } catch (e) {
      console.error(e)
      datadogRum.stopDurationVital(VITAL_NAME, {
        vitalKey: slot,
        context: { outcome: 'fetch_error' },
      })
      setLoading(false)
    }
  }, [adsPath, getRandomArbitrary, setData, setLoading, slot])

  useEffect(() => {
    if (!data) fetchAd()
  }, [data, fetchAd])

  if (isLoading || !data) { 
    return (
      <div className="banner-ad-row"></div>
    )
  }

  return (
    <div className="banner-ad-row flex flex-col justify-center py-2 ">
      <div className="banner-ad-container mx-auto my-auto" id={adContainerId}>
        <a href="#">
          <div className="h-auto w-full mx-auto hover:ring banner-ad-image-wrapper">
            <picture className="advertisement-banner">
              <img
                src={`${adsPath}/banners/${data.path}`}
                alt={`${data.name} Advertisement`}
                onLoad={() => stopAdVital('success')}
                onError={() => stopAdVital('image_error')}
              />
            </picture>
          </div>
        </a>
        <p className="text-xs">Advertisement</p>
      </div>
    </div>
  )
}

export default Ad
