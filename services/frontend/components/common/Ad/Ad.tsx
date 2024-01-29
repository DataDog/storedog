import * as React from 'react';
import { useState } from 'react'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

export interface AdDataResults {
  data: object | null
  path: string
}
// Advertisement banner
function Ad() {
  const [data, setData] = React.useState<AdDataResults | null>(null)
  const [isLoading, setLoading] = React.useState(false)
  const adsPath = `${process.env.NEXT_PUBLIC_ADS_ROUTE}:${process.env.NEXT_PUBLIC_ADS_PORT}`
  const [codeFlag, setCodeFlag] = useState<boolean>(false)


  function getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function fetchAd(flag: boolean) {
    const headers = {
      'X-Throw-Error': `${flag}`,
    };
    fetch(`${adsPath}/ads`, { headers })
      .then((res) => res.json())
      .then((data) => {
        const index = getRandomArbitrary(0, data.length);
        setData(data[index])
      })
      .catch(e => console.error(e.message))
      .finally(() => {
        setLoading(false)
      })
  }

  React.useEffect(() => {
    setLoading(true)
    //  check for config file, then grab feature flags
    if (config) {
      codeStash('error-tracking', { file: config })
        .then((r: boolean) => {
          setCodeFlag(r)
        })
        .catch((e: Error) => console.log(e))
    }

    // Fetch ad with error
    codeFlag && fetchAd(true)


    // Fetch normal ad
    !codeFlag && fetchAd(false)

  }, [codeFlag])

  if (isLoading) return (
    <div className="flex flex-row justify-center h-10">
      AD HERE
    </div>
  )
  if (!data) return (
    <div className="flex flex-row justify-center h-10">
      AD HERE
    </div>
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