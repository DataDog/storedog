import cn from 'clsx'
import Link from 'next/link'
import { FC } from 'react'
import s from './CartSidebarView.module.css'
import CartItem from '../CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import { Bag, Cross, Check } from '@components/icons'
import { useCart } from '@lib/CartContext'
import usePrice from '@lib/hooks/usePrice'
import SidebarLayout from '@components/common/SidebarLayout'

const CartSidebarView: FC = () => {
  const { closeSidebar, setSidebarView } = useUI()
  const { cart } = useCart()

  const { price: subTotal } = usePrice(
    cart && {
      amount: Number(cart.subtotalPrice),
      currencyCode: cart.currency.code,
    }
  )
  const { price: total } = usePrice(
    cart && {
      amount: Number(cart.totalPrice),
      currencyCode: cart.currency.code,
    }
  )
  const handleClose = () => closeSidebar()
  const goToCheckout = () => setSidebarView('CHECKOUT_VIEW')

  const error = null
  const success = null

  return (
    <SidebarLayout
      className={cn({
        [s.empty]: error || success || !cart,
      })}
      handleClose={handleClose}
    >
      {!cart || !cart.lineItems.length ? (
        <div className="flex-1 px-4 flex flex-col justify-center items-center">
          <span className="border border-dashed border-primary rounded-full flex items-center justify-center w-16 h-16 p-12 bg-secondary text-secondary">
            <Bag className="absolute" />
          </span>
          <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
            Your cart is empty
          </h2>
          <p className="text-accent-3 px-10 text-center pt-2">
            Biscuit oat cake wafer icing ice cream tiramisu pudding cupcake.
          </p>
        </div>
      ) : error ? (
        <div className="flex-1 px-4 flex flex-col justify-center items-center">
          <span className="border border-white rounded-full flex items-center justify-center w-16 h-16">
            <Cross width={24} height={24} />
          </span>
          <h2 className="pt-6 text-xl font-light text-center">
            We couldn't process the purchase. Please check your card information
            and try again.
          </h2>
        </div>
      ) : success ? (
        <div className="flex-1 px-4 flex flex-col justify-center items-center">
          <span className="border border-white rounded-full flex items-center justify-center w-16 h-16">
            <Check />
          </span>
          <h2 className="pt-6 text-xl font-light text-center">
            Thank you for your order.
          </h2>
        </div>
      ) : (
        <>
          <div className="px-4 sm:px-6 flex-1">
            <Link href="/cart">
              <a>
                <Text variant="sectionHeading" onClick={handleClose}>
                  My Cart
                </Text>
              </a>
            </Link>
            <ul className={s.lineItemsList}>
              {cart?.lineItems.map((item: any) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency.code}
                />
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm">
            <ul className="pb-2">
              <li className="flex justify-between py-1">
                <span>Subtotal</span>
                <span>{subTotal}</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Shipping</span>
                <span className="font-bold tracking-wide">
                  {Number(cart?.shipTotal).toFixed(2) || 'TBD'}
                </span>
              </li>
            </ul>
            <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
              <span>Total</span>
              <span>{total}</span>
            </div>
            <div id="proceed-to-checkout">
              <Button
                Component="button"
                width="100%"
                onClick={goToCheckout}
                className="checkout-btn"
                data-dd-action-name="Proceed to Checkout"
              >
                Proceed to Checkout ({total})
              </Button>
            </div>
          </div>
        </>
      )}
    </SidebarLayout>
  )
}

export default CartSidebarView
