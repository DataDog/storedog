import * as React from 'react';

export interface DiscountCodeResults {
  data: string | null
}

function Discount() {
  const [data, setData] = React.useState<DiscountCodeResults | null>(null)
  const [isLoading, setLoading] = React.useState(false)
  const discountPath = `${process.env.NEXT_PUBLIC_DISCOUNTS_ROUTE}:${process.env.NEXT_PUBLIC_DISCOUNTS_PORT}`

  function getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function fetchDiscountCode() {
    fetch(`${discountPath}/discount`)
      .then((res) => res.json())
      .then((data) => {
        const index = getRandomArbitrary(0, data.length);
        setData(data[index]["code"])
      })
      .catch(e => { console.error(e.message) })
      .finally(() => { setLoading(false) })
  }

  React.useEffect(() => {
    setLoading(true)
    fetchDiscountCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="flex flex-row justify-center py-4 bg-primary-2 text-white">
      {
        isLoading ? (<span>GET FREE SHIPPING WITH DISCOUNT CODE</span>) :
          !data ? (<span>GET FREE SHIPPING WITH DISCOUNT CODE <strong>STOREDOG</strong></span>) : (<span>GET FREE SHIPPING WITH DISCOUNT CODE &nbsp; <strong>{data}</strong></span>)
      }
    </div>
  )

}

export default Discount