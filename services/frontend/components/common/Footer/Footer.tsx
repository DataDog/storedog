import React, { FC } from 'react'
import cn from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import getSlug from '@lib/get-slug'
import { Logo, Container } from '@components/ui'
import s from './Footer.module.css'

import { Page } from '@customTypes/page'

interface Props {
  className?: string
  children?: any
  pages?: Page[]
}

const links = [
  {
    name: 'Home',
    url: '/',
  },
]

const Footer: FC<Props> = ({ className, pages = [] }) => {
  const rootClassName = cn(s.root, className)

  return (
    <footer className={rootClassName}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-accent-2 py-12 text-primary bg-primary transition-colors duration-150">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/">
              <a className="flex flex-initial items-center font-bold md:mr-24">
                <span className="mr-2 bg-primary-2 text-white px-3 py-2">
                  <Logo />
                </span>
              </a>
            </Link>
          </div>
          <div className="col-span-1 lg:col-span-8">
            <div className="grid md:grid-rows-4 md:grid-cols-3 md:grid-flow-col">
              {[...links, ...pages].map((page) => (
                <span key={page.name} className="py-3 md:py-0 md:pb-4">
                  <Link href={page.url!}>
                    <a className="text-accent-9 hover:text-accent-6 transition ease-in-out duration-150">
                      {page.name}
                    </a>
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 pb-10 flex flex-col md:flex-row justify-between items-center space-y-4 text-accent-6 text-sm">
          <div>
            <span>
              &copy; {new Date().getFullYear()} Storedog, Inc. All rights
              reserved.
            </span>
            <br />
            <span>
              *Unfortunately, nothing here is actually for sale. This site is
              for{' '}
              <a
                href="https://datadoghq.com"
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                Datadog
              </a>{' '}
              training lab purposes only.*
            </span>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
