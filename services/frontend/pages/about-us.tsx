import { Layout } from '@components/common'
import { useEffect, useState } from 'react'
import { Page } from '@customTypes/page'

const SPREE_URL_CLIENTSIDE = process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST}/api/v2`
  : 'http://localhost:4000/api/v2'

export default function AboutUs({ page }: { page: Page }) {

  const [imageURL, setImageURL] = useState("")
  
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch(`${SPREE_URL_CLIENTSIDE}/about-us-api`)
        if (!res.ok) {
          throw new Error('Error fetching image URL')
        }
        const data = await res.json()
        setImageURL(data.image)
      } catch (e) {
        console.error(e)
      }
    };
    fetchUrl();
  }, [])

  return(
    <div className="max-w-2xl mx-8 sm:mx-auto py-20">
      <h2>About Us</h2>
      <p>Welcome to our store! We are passionate about bringing you the best products at unbeatable prices. Our mission is to provide a seamless shopping experience, combining quality, value, and exceptional customer service. Thank you for choosing us for your shopping needs!</p>
      <img src={imageURL} className="max-w-2xl mx-8 sm:mx-auto py-20" alt="" id="about-us-image" />
    </div>
  )
}

AboutUs.Layout = Layout
