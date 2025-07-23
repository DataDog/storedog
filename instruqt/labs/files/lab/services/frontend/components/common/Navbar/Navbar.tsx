import { FC, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo, Container } from '@components/ui'
import { Searchbar, UserNav } from '@components/common'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

const dbmUrl = `${process.env.NEXT_PUBLIC_DBM_ROUTE}/get-item`

const Navbar: FC<NavbarProps> = ({}) => {
  // Set the input value from the form to state
  const [dbmFlag, setDbmFlag] = useState<boolean>()
  const [productInfo, setProductInfo] = useState<object | undefined>()

  const fetchRandomOrderCount = useCallback(async () => {
    try {
      // List of products on the site
      const randomProducts = [
        'Cool Bits',
        'Hockey Bits',
        'Money Bits',
        'Octo Bits',
        'Bits By Dre',
      ]

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }

      const res = await fetch(dbmUrl, options)
      const response = await res.json()
      // select a product name from the list at random
      let productName = randomProducts[Math.floor(Math.random() * 5)]
      // prevent product name from repeating 2 times in a row
      if (productInfo && productInfo.productName === productName) {
        // remove the productName that is being displayed from the list and get a new one
        randomProducts.splice(
          randomProducts.findIndex((i) => i === productName),
          1
        )
        // set the name to the new one
        productName = randomProducts[Math.floor(Math.random() * 4)]
      }

      // set the info that is displayed
      setProductInfo({
        productName,
        count: response.last_hour,
      })
    } catch (e) {
      console.error((e as Error).message)
    }
  }, [productInfo, setProductInfo])

  useEffect(() => {
    if (config) {
      codeStash('dbm', { file: config })
        .then((r: boolean) => setDbmFlag(r))
        .catch((e) => console.log(e))
    }
  }, [])

  // Specific to the dbm lab, will only be active if the dbm flag is tru
  useEffect(() => {
    if (dbmFlag) {
      // To simulate the ticker effect, we call this every 5 seconds, which will also run the query every 5 seconds
      setTimeout(async () => {
        await fetchRandomOrderCount()
      }, 5000)
    }
  }, [dbmFlag, productInfo, fetchRandomOrderCount])

  return (
    <NavbarRoot>
      <Container clean className="mx-auto max-w-8xl px-6">
        <div className={s.nav}>
          <div className="flex items-center flex-1">
            <Link href="/">
              <a className={s.logo} aria-label="Logo">
                <Logo />
              </a>
            </Link>
            <nav className={s.navMenu} id="main-navbar">
              <Link href="/products">
                <a className={s.link} id="all-products-link">
                  Products
                </a>
              </Link>
              <Link href="/taxonomies/categories/bestsellers">
                <a className={s.link} id="bestsellers-link">
                  Best Sellers
                </a>
              </Link>
              <Link href="/taxonomies/categories/new">
                <a className={s.link} id="new-items-link">
                  New
                </a>
              </Link>
              <Link href="/taxonomies/categories/tops">
                <a className={s.link} id="tops-link">
                  Tops
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center justify-end flex-1 space-x-8">
            <UserNav />
          </div>
        </div>

        {dbmFlag && productInfo && (
          <p className="flex justify-center py-3 font-semibold">
            {productInfo.productName} was ordered {productInfo.count} times in
            the last hour 🔥
          </p>
        )}
      </Container>
    </NavbarRoot>
  )
}

export default Navbar
