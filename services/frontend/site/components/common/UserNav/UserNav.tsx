import React from 'react'
import cn from 'clsx'
import Link from 'next/link'
import s from './UserNav.module.css'
import { Avatar } from '@components/common'
import { useUI } from '@components/ui/context'
import { Heart, Bag, Menu } from '@components/icons'
import CustomerMenuContent from './CustomerMenuContent'
import useCustomer from '@framework/customer/use-customer'
import { useCart } from '@lib/CartContext'
import {
  Dropdown,
  DropdownTrigger as DropdownTriggerInst,
  Button,
} from '@components/ui'

import type { LineItem } from '@commerce/types/cart'

const countItem = (count: number, item: LineItem) => count + item.quantity

const UserNav: React.FC<{
  className?: string
}> = ({ className }) => {
  const { cart } = useCart()
  const { data: isCustomerLoggedIn } = useCustomer()
  const {
    toggleSidebar,
    closeSidebarIfPresent,
    openModal,
    setSidebarView,
    openSidebar,
  } = useUI()

  console.log('cart', cart)
  const itemsCount = cart?.lineItems?.reduce(countItem, 0) ?? 0
  const DropdownTrigger = isCustomerLoggedIn
    ? DropdownTriggerInst
    : React.Fragment

  return (
    <nav className={cn(s.root, className)} id="user-nav">
      <ul className={s.list}>
        {process.env.COMMERCE_CART_ENABLED && (
          <li className={s.item}>
            <Button
              className={`${s.item} toggle-cart`}
              variant="naked"
              data-dd-action-name="Toggle Cart"
              onClick={() => {
                setSidebarView('CART_VIEW')
                openSidebar()
              }}
              aria-label={`Cart items: ${itemsCount}`}
            >
              <Bag />
              {itemsCount > 0 && (
                <span className={s.bagCount}>{itemsCount}</span>
              )}
            </Button>
          </li>
        )}
        {/* {process.env.COMMERCE_WISHLIST_ENABLED && (
          <li className={s.item}>
            <Link href="/wishlist">
              <a
                onClick={closeSidebarIfPresent}
                aria-label="Wishlist"
                id="wishlist"
              >
                <Heart />
              </a>
            </Link>
          </li>
        )}
        {process.env.COMMERCE_CUSTOMERAUTH_ENABLED && (
          <li className={s.item}>
            <Dropdown>
              <DropdownTrigger>
                <button
                  aria-label="Menu"
                  className={s.avatarButton}
                  id="customer-button"
                  onClick={() => (isCustomerLoggedIn ? null : openModal())}
                >
                  <Avatar />
                </button>
              </DropdownTrigger>
              <CustomerMenuContent />
            </Dropdown>
          </li>
        )} */}
        <li className={s.mobileMenu}>
          <Button
            className={s.item}
            aria-label="Menu"
            variant="naked"
            onClick={() => {
              setSidebarView('MOBILE_MENU_VIEW')
              openSidebar()
            }}
          >
            <Menu />
          </Button>
        </li>
      </ul>
    </nav>
  )
}

export default UserNav
