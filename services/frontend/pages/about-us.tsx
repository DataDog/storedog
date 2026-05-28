import { Layout } from '@components/common'
import { useEffect, useState } from 'react'
import { Page } from '@customTypes/page'


const SPREE_URL_CLIENTSIDE = process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST}/api/v2`
  : 'http://localhost:4000/api/v2'

export default function AboutUs({ page }: { page: Page }) {

  // const [loading, setLoading] = useState(true)
  const [styles, setStyles] = useState("max-w-2xl mx-8 sm:mx-auto py-20")
  const [imageURL, setImageURL] = useState("")
  
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch(`${SPREE_URL_CLIENTSIDE}/about-us-api`)
        if (!res.ok) {
          throw new Error('Error fetching ad')
        }
        const data = await res.json()
        console.log(data)
        setImageURL(data.image)
        // setLoading(false)
      } catch (e) {
        console.error(e)
      }
    };
    fetchUrl();
  }, [])

  return(
    <div className="max-w-2xl mx-8 sm:mx-auto py-20">
      <h2>About Us</h2>
      <p>Here's who we are. We sell stuff.</p>
      <img src={imageURL} className={styles} alt="" id="about-us-image" />
    </div>
  )
}

AboutUs.Layout = Layout
