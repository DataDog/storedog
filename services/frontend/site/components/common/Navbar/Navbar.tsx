import {FC, useEffect, useState} from 'react'
import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import {Logo, Container} from '@components/ui'
import {Searchbar, UserNav} from '@components/common'
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

const Navbar: FC<NavbarProps> = ({links}) => {
    // Set the input value from the form to state
    const [inputValue, setInputValue] = useState<string | undefined>()
    const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false)
    const [showEmailInput, setShowEmailInput] = useState<boolean>(true)
    const [codeFlag, setCodeFlag] = useState<boolean>()
    const [userEmail, setUserEmail] = useState<string | undefined>()

    useEffect(() => {
        if (config) {
        codeStash('xss', {file:config} ).then((r: boolean) => setCodeFlag(r)).catch(e => console.log(e))
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // Bail early if env var isn't set
        if (!codeFlag) return
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
                {codeFlag && showEmailInput &&
                    // Used as an example for XSS detection in Datadog
                    <div className=" pb-1">
                        <form className="flex flex-col" onSubmit={handleSubmit}>
                            <label htmlFor='email-input' className='mb-1'>Enter email for discounts:</label>
                            <div className="flex items-center">
                                <input onChange={(e) => setInputValue(e.target.value)} id='email-input'
                                       className="py-2 px-2 mr-2 relative" type="text" placeholder="bits@dtdg.co"/>
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
                {!showEmailInput && codeFlag &&
                    <p className="font-bold">Thank you for signing up {userEmail}!</p>
                }
            </Container>
        </NavbarRoot>
    )
}

export default Navbar;
