import * as React from 'react'

export interface DiscountCodeResults {
  data: string | null
}

function Discount() {
  const [data, setData] = React.useState<DiscountCodeResults | null>(null)
  const [isLoading, setLoading] = React.useState(false)
  const discountPath = process.env.NEXT_PUBLIC_DISCOUNTS_ROUTE

  function getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  function fetchDiscountCode() {
    setLoading(true) // Ensure the loading state is set before fetching
    fetch(`${discountPath}/discount`)
      .then((res) => {
        if (!res.ok) {
          // Handle HTTP errors explicitly
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const index = getRandomArbitrary(0, data.length)
          setData(data[index]['code'])
        } else {
          throw new Error('No discount data found.')
        }
      })
      .catch((e) => {
        console.error('An error occurred while fetching the discount code:', e)
      })
      .finally(() => {
        setLoading(false) // Ensure loading state is updated
      })
  }

  React.useEffect(() => {
    setLoading(true)
    fetchDiscountCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading && !data) {
    return (
      <div className="flex flex-row justify-center py-4 bg-primary-2 min-h-[56px] h-[56px] text-white discount-wrapper">
        <div className="h-[24px] shrink-0"><p></p></div>
      </div>

    )
  }

  if (!isLoading && !data) {
    <div className="flex flex-row justify-center py-4 bg-primary-2 h-[56px] text-white discount-wrapper">
        <div className="h-[24px] shrink-0">
          <p>GET FREE SHIPPING WITH DISCOUNT CODE <strong>STOREDOG</strong></p>
        </div>
      </div>
  }

  if (!isLoading && data) {
    return (
      <div className="flex flex-row justify-center py-4 bg-primary-2 h-[56px] text-white discount-wrapper">
          <div className="h-[24px] shrink-0">
            <p>GET FREE SHIPPING WITH DISCOUNT CODE &nbsp;{' '}<strong id="discount-code">{data}</strong></p>
          </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row justify-center py-4 shrink-0 bg-primary-2 h-[56px] text-white discount-wrapper">
      <div className="h-[24px] shrink-0">

      </div>
    </div>
  )

}

export default Discount
