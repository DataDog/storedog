import { useState, useEffect } from 'react'
import { Layout } from '@components/common'

const SPREE_URL_CLIENTSIDE = process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST
  ? `${process.env.NEXT_PUBLIC_SPREE_CLIENT_HOST}/api/v2`
  : 'http://localhost:4000/api/v2'

export default function AboutUs() {
    const [url, setUrl] = useState('')

    useEffect(() => {
      const fetchUrl = async () => {
        try {
          const res = await fetch(`${SPREE_URL_CLIENTSIDE}/about-us-api`)
          if (!res.ok) {
            throw new Error('Error fetching ad')
          }
          const data = await res.json()
          console.log(data)
          setUrl(data.image)
        } catch (e) {
          console.error(e)
        }
      };
      fetchUrl();
      
    }, []);


    return(
      <div className="max-w-2xl mx-8 sm:mx-auto py-20">
        <p>This is the About Us page</p>
        <img src={url} className="max-w-2xl mx-8 sm:mx-auto py-20 opacity-100" alt="" id="about-us-image" />
      </div>
    )
  }

  AboutUs.Layout = Layout
