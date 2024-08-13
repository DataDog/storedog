import Link from 'next/link'
import { FC, useState } from 'react'
import cn from 'clsx'
import { datadogRum } from '@datadog/browser-rum'

import CartItem from '@components/cart/CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import { useCart } from '@lib/CartContext'
import usePrice from '@lib/hooks/usePrice'
import ShippingWidget from '../ShippingWidget'
import PaymentWidget from '../PaymentWidget'
import { useCheckoutContext } from '../context'

import s from './CheckoutSidebarView.module.css'

const CheckoutSidebarView: FC = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [discountInput, setDiscountInput] = useState('')
  const [checkoutError, setCheckoutError] = useState(null)
  const { setSidebarView, closeSidebar } = useUI()
  const { cart: cartData, cartEmpty, cartInit, applyDiscount } = useCart()
  const {
    shippingRate,
    addressStatus,
    paymentStatus,
    clearCheckoutFields,
    handleCompleteCheckout,
  } = useCheckoutContext()

  const { price: subTotal } = usePrice(
    cartData && {
      amount: Number(cartData.subtotalPrice),
      currencyCode: cartData.currency.code,
    }
  )
  const { price: total } = usePrice(
    cartData && {
      amount: Number(cartData.totalPrice),
      currencyCode: cartData.currency.code,
    }
  )

  async function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    try {
      setLoadingSubmit(true)
      event.preventDefault()

      const res = await handleCompleteCheckout()
      console.log('checkout response', res)
      if (res.error) {
        throw res.error
      }

      console.log('cartData', cartData)

      datadogRum.addAction('Successful Checkout', {
        id: cartData.id,
        cart_total: cartData.totalPrice,
        created_at: cartData.createdAt,
        discounts: cartData.discounts,
      })

      cartData.lineItems.forEach((item: any) => {
        datadogRum.addAction('Product Purchased', {
          product: {
            id: item.id,
            name: item.name,
            variant: item.variant.name,
            quantity: item.quantity,
            price: item.variant.price,
          },
        })
      })

      // clearCheckoutFields()
      setLoadingSubmit(false)
      await cartEmpty()
      await cartInit()
      setSidebarView('ORDER_CONFIRM_VIEW')
    } catch (e) {
      console.log(e)
      setCheckoutError(e)
      setLoadingSubmit(false)
    }
  }

  async function handleDiscount(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!discountInput) {
      console.error('No discount input!')
      return
    }

    try {
      const discountPath =
        `${process.env.NEXT_PUBLIC_DISCOUNTS_URL_FULL}` ||
        `${process.env.NEXT_PUBLIC_DISCOUNTS_ROUTE}:${process.env.NEXT_PUBLIC_DISCOUNTS_PORT}`
      const discountCode = discountInput.toUpperCase()
      // call discounts service
      const res = await fetch(
        `${discountPath}/discount-code?discount_code=${discountCode}`
      )

      if (!res.ok) {
        const error = await res.json()
        throw error
      }

      const discount = await res.json()

      if (discount?.error) {
        throw discount.error
      }

      console.log('discount accepted', discount)

      await applyDiscount('FREESHIP')

      setDiscountInput('')
    } catch (err) {
      datadogRum.addError(err, {
        discount_code: discountInput,
      })
    }
  }

  return (
    <SidebarLayout
      className={s.root}
      id="sidebar"
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className="px-4 sm:px-6 flex-1">
        <Text variant="sectionHeading">Checkout</Text>
        {checkoutError && (
          <div className="text-red border border-red p-3 mb-3">
            {checkoutError}
          </div>
        )}

        <PaymentWidget
          isValid={paymentStatus.ok || false}
          onClick={() => setSidebarView('PAYMENT_VIEW')}
        />
        <ShippingWidget
          isValid={addressStatus.ok || false}
          onClick={() => setSidebarView('SHIPPING_VIEW')}
        />

        <ul className={s.lineItemsList}>
          {cartData?.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={cartData!.currency.code}
              variant="display"
            />
          ))}
        </ul>

        <form
          className="h-full mt-auto"
          onSubmit={handleDiscount}
          id="discount-form"
        >
          <div className={cn(s.fieldset, 'col-span-6')}>
            <label className={s.label}>Discount Code</label>
            <input
              name="discount-code"
              className={s.input}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
            />
          </div>
          <div className="w-full">
            <Button
              type="submit"
              width="100%"
              variant="ghost"
              className="!py-2 !border-1"
              data-dd-action-name="Apply Discount"
            >
              Apply Discount
            </Button>
          </div>
        </form>
      </div>

      <form
        onSubmit={handleSubmit}
        id="checkout-form"
        className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm"
      >
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
            <span className="font-bold tracking-wide" id="shipping-rate">
              {shippingRate?.price || 'TBD'}
            </span>
          </li>
        </ul>
        <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
          <span>Total</span>
          <span>{total}</span>
        </div>
        <div>
          {/* Once data is correctly filled */}
          <Button
            type="submit"
            width="100%"
            loading={loadingSubmit}
            className="confirm-purchase-btn"
            data-dd-action-name="Confirm Purchase"
            disabled={addressStatus.ok && paymentStatus.ok ? false : true}
          >
            Confirm Purchase
          </Button>
        </div>
      </form>
    </SidebarLayout>
  )
}

export default CheckoutSidebarView
