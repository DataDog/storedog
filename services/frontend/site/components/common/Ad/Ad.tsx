import * as React from 'react';

export interface AdDataResults {
    data: object | null
    path: string
}
// Advertisement banner
function Ad() {
  const [data, setData] = React.useState<AdDataResults | null>(null)
  const [isLoading, setLoading] = React.useState(false)
  const adsPath = `${process.env.NEXT_PUBLIC_ADS_ROUTE}:${process.env.NEXT_PUBLIC_ADS_PORT}`

  function getRandomArbitrary(min: number, max:number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function fetchAd() {
      fetch(`${adsPath}/ads`)
          .then((res) => res.json())
          .then((data) => {
              const index = getRandomArbitrary(0,data.length);
              setData(data[index])
          })
          .catch(e => console.error(e.message))
          .finally(() => {
              setLoading(false)
          })
  }

  React.useEffect(() => {
      setLoading(true)
      fetchAd()
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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