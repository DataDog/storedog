import React from 'react'
import cn from 'clsx'
import s from './UserNav.module.css'
import { useUI } from '@components/ui/context'
import { Bag, Menu } from '@components/icons'
import { useCart } from '@lib/CartContext'
import { Button } from '@components/ui'

const countItem = (count: number, item: any) => count + item.quantity

const UserNav: React.FC<{
  className?: string
}> = ({ className }) => {
  const { cart } = useCart()
  const { setSidebarView, openSidebar } = useUI()

  const itemsCount = cart?.lineItems?.reduce(countItem, 0) ?? 0

  return (
    <nav className={cn(s.root, className)} id="user-nav">
      <ul className={s.list}>
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
            {itemsCount > 0 && <span className={s.bagCount}>{itemsCount}</span>}
          </Button>
        </li>
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
