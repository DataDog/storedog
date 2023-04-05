import { FC, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo, Container } from '@components/ui'
import { Searchbar, UserNav } from '@components/common'
import { codeStash } from 'code-stash'
import config from '../../../featureFlags.config.json'

interface Link {
    href: string
    label: string
}

interface NavbarProps {
    links?: Link[]
}

const authUrl = `${process.env.NEXT_PUBLIC_AUTH_ROUTE}:${process.env.NEXT_PUBLIC_AUTH_PORT}/email`
const dbmUrl = `${process.env.NEXT_PUBLIC_DBM_ROUTE}:${process.env.NEXT_PUBLIC_DBM_PORT}/get-item`

const Navbar: FC<NavbarProps> = ({ links }) => {
    // Set the input value from the form to state
    const [inputValue, setInputValue] = useState<string | undefined>()
    const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false)
    const [showEmailInput, setShowEmailInput] = useState<boolean>(true)
    const [xssFlag, setXssFlag] = useState<boolean>()
    const [dbmFlag, setDbmFlag] = useState<boolean>()
    const [userEmail, setUserEmail] = useState<string | undefined>()
    const [productInfo, setProductInfo] = useState<object | undefined>()

    useEffect(() => {
        if (config) {
            codeStash('xss', { file: config }).then((r: boolean) => setXssFlag(r)).catch(e => console.log(e))
            codeStash('dbm', { file: config }).then((r: boolean) => setDbmFlag(r)).catch(e => console.log(e))
        }
    }, [])

    // Specific to the dbm lab, will only be active if the dbm flag is tru
    useEffect(() => {
        if (dbmFlag) {
            // To simulate the ticker effect, we call this every 5 seconds, which will also run the query every 5 seconds
            setTimeout(async () => {
                await fetchRandomOrderCount()
            }, 4000);
        }
    }, [dbmFlag, productInfo])
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // Bail early if env var isn't set
        if (!xssFlag) return
        e.preventDefault()
        // Display warning if there is no input
        if (!inputValue) {
            setShowWarningMessage(true)
            return
        }

        try {
            // Clear warning if any
            if (showWarningMessage) setShowWarningMessage(false)
            // set options for fetch
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST"
                },
                body: `email=${inputValue}`
            }
            // Execute our post request to the server
            const res = await fetch(authUrl, options)
            // Parse our response
            const response = await res.json()
            // Grab the users email from the response on a successful request
            const user = response["User_Email"]
            // Set the username to state to be added to the DOM
            setUserEmail(user)
            // Exit the function
            return
        } catch (e) {
            // Log out any errors
            console.error((e as Error).message)
        } finally {
            // Reset the input and hide it
            setInputValue(undefined)
            setShowEmailInput(false)
        }
    }

    const fetchRandomOrderCount = async () => {
        try {
            // List of products on the site
            const randomProducts = [
                'Cool Bits',
                'Hockey Bits',
                'Money Bits',
                'Octo Bits',
                'Bits By Dre'
            ]

            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET"
                }
            }

            const res = await fetch(dbmUrl, options)
            const response = await res.json()
            // select a product name from the list at random
            let productName = randomProducts[Math.floor(Math.random() * 5)]
            // prevent product name from repeating 2 times in a row
            if (productInfo && productInfo.productName === productName) {
                // remove the productName that is being displayed from the list and get a new one
                randomProducts.splice(randomProducts.findIndex((i) => i === productName), 1)
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
    }


    return (
        <NavbarRoot>
            <Container clean className="mx-auto max-w-8xl px-6">
                <div className={s.nav}>
                    <div className='flex items-center flex-1'>
                        <Link href='/'>
                            <a className={s.logo} aria-label='Logo'>
                                <Logo />
                            </a>
                        </Link>
                        <nav className={s.navMenu} id='main-navbar'>
                            <Link href='/search'>
                                <a className={s.link} id='all-products-link'>
                                    All Products
                                </a>
                            </Link>
                            {links?.map((l) => (
                                <Link href={l.href} key={l.href}>
                                    <a className={s.link}>{l.label}</a>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {process.env.COMMERCE_SEARCH_ENABLED && (
                        <div className='justify-center flex-1 hidden lg:flex'>
                            <Searchbar />
                        </div>
                    )}
                    <div className='flex items-center justify-end flex-1 space-x-8'>
                        <UserNav />
                    </div>
                </div>
                {process.env.COMMERCE_SEARCH_ENABLED && (
                    <div className='flex pb-4 lg:px-6 lg:hidden'>
                        <Searchbar id='mobile-search' />
                    </div>
                )}
                {xssFlag && showEmailInput &&
                    // Used as an example for XSS detection in Datadog
                    <div className=" pb-1">
                        <form className="flex flex-col" onSubmit={handleSubmit}>
                            <label htmlFor='email-input' className='mb-1'>Enter email for discounts:</label>
                            <div className="flex items-center">
                                <input onChange={(e) => setInputValue(e.target.value)} id='email-input'
                                    className="py-2 px-2 mr-2 relative" type="text" placeholder="bits@dtdg.co" />
                                <button
                                    className="border-2 px-2 py-1 rounded cursor-pointer hover:border-purple-600">submit
                                </button>
                            </div>
                            {showWarningMessage &&
                                <p className="font-bold pt-1 text-rose-700 italic lg:absolute -bottom-7">*You must enter
                                    an email address to submit</p>
                            }
                        </form>
                    </div>
                }
                {!showEmailInput && xssFlag &&
                    <p className="font-bold">Thank you for signing up {userEmail}!</p>
                }
                {dbmFlag && productInfo &&
                    <p className="flex justify-center py-3 font-semibold">{productInfo.productName} was ordered {productInfo.count} times in the last hour 🔥</p>
                }
            </Container>
        </NavbarRoot>
    )
}

export default Navbar;
