import Link from 'next/link';
import { FC, useState } from 'react';
import cn from 'clsx';

import CartItem from '@components/cart/CartItem';
import { Button, Text } from '@components/ui';
import { useUI } from '@components/ui/context';
import SidebarLayout from '@components/common/SidebarLayout';
import useCart from '@framework/cart/use-cart';
import usePrice from '@framework/product/use-price';
import useCheckout from '@framework/checkout/use-checkout';
import ShippingWidget from '../ShippingWidget';
import PaymentWidget from '../PaymentWidget';
import s from './CheckoutSidebarView.module.css';
import { useCheckoutContext } from '../context';
import useRemoveItem from '@framework/cart/use-remove-item';
import { datadogRum } from '@datadog/browser-rum';

const onMockCheckout = async () => {
  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  await sleep(2000);
  return new Promise((resolve, reject) => {
    resolve(true);
  });
};

const CheckoutSidebarView: FC = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const { setSidebarView, closeSidebar } = useUI();
  const { data: cartData, mutate: refreshCart } = useCart();
  const { data: checkoutData, submit: onCheckout } = useCheckout();
  const removeItem = useRemoveItem();
  const { clearCheckoutFields } = useCheckoutContext();

  const { price: subTotal } = usePrice(
    cartData && {
      amount: Number(cartData.subtotalPrice),
      currencyCode: cartData.currency.code,
    }
  );
  const { price: total } = usePrice(
    cartData && {
      amount: Number(cartData.totalPrice),
      currencyCode: cartData.currency.code,
    }
  );

  async function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    try {
      setLoadingSubmit(true);
      event.preventDefault();

      await onMockCheckout();
      
      // Custom RUM action
      datadogRum.addAction('Successful Checkout', {
        cartTotal: cartData.totalPrice,
        createdAt: cartData.createdAt,
        discounts: cartData.discounts,
        id: cartData.id,
        lineItems: cartData.lineItems,
      });

      for (const product of cartData.lineItems) {
        await removeItem(product);
      }

      clearCheckoutFields();
      setLoadingSubmit(false);
      refreshCart(); // This doesn't seem to work
      setSidebarView('ORDER_CONFIRM_VIEW');
    } catch (e) {
      console.log(e);
      setLoadingSubmit(false);
    }
  }

  async function handleDiscount(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!discountInput) {
      console.error('No discount input!');
      return;
    }

    try {
      const discountPath = `${process.env.NEXT_PUBLIC_DISCOUNTS_ROUTE}:${process.env.NEXT_PUBLIC_DISCOUNTS_PORT}`;
      const discountCode = discountInput.toUpperCase();
      // call discounts service
      const res = await fetch(
        `${discountPath}/discount-code?discount_code=${discountCode}`
      );
      const discount = await res.json();

      if (discount?.error) {
        throw 'No discount found!';
      }

      console.log('discount accepted', discount);
      setDiscountInput('');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SidebarLayout
      className={s.root}
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className='px-4 sm:px-6 flex-1'>
        <Link href='/cart'>
          <a>
            <Text variant='sectionHeading'>Checkout</Text>
          </a>
        </Link>

        <PaymentWidget
          isValid={checkoutData?.hasPayment}
          onClick={() => setSidebarView('PAYMENT_VIEW')}
        />
        <ShippingWidget
          isValid={checkoutData?.hasShipping}
          onClick={() => setSidebarView('SHIPPING_VIEW')}
        />

        <ul className={s.lineItemsList}>
          {cartData!.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={cartData!.currency.code}
              variant='display'
            />
          ))}
        </ul>

        <form
          className='h-full mt-auto'
          onSubmit={handleDiscount}
          id='discount-form'
        >
          <div className={cn(s.fieldset, 'col-span-6')}>
            <label className={s.label}>Discount Code</label>
            <input
              name='discount-code'
              className={s.input}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
            />
          </div>
          <div className='w-full'>
            <Button
              type='submit'
              width='100%'
              variant='ghost'
              className='!py-2 !border-1'
            >
              Apply Discount
            </Button>
          </div>
        </form>
      </div>

      <form
        onSubmit={handleSubmit}
        id='checkout-form'
        className='flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm'
      >
        <ul className='pb-2'>
          <li className='flex justify-between py-1'>
            <span>Subtotal</span>
            <span>{subTotal}</span>
          </li>
          <li className='flex justify-between py-1'>
            <span>Taxes</span>
            <span>Calculated at checkout</span>
          </li>
          <li className='flex justify-between py-1'>
            <span>Shipping</span>
            <span className='font-bold tracking-wide'>FREE</span>
          </li>
        </ul>
        <div className='flex justify-between border-t border-accent-2 py-3 font-bold mb-2'>
          <span>Total</span>
          <span>{total}</span>
        </div>
        <div>
          {/* Once data is correctly filled */}
          <Button
            type='submit'
            width='100%'
            loading={loadingSubmit}
            className='confirm-purchase-btn'
            data-dd-action-name='Confirm Purchase'
          >
            Confirm Purchase
          </Button>
        </div>
      </form>
    </SidebarLayout>
  );
};

export default CheckoutSidebarView;
