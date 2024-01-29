import { FC } from 'react'
import cn from 'clsx'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import { useCheckoutContext } from '../context'

import s from './PaymentMethodView.module.css'

interface Form extends HTMLFormElement {
  cardHolder: HTMLInputElement
  number: HTMLInputElement
  verification_value: HTMLInputElement
  cc_type: HTMLInputElement
  expiration: HTMLInputElement
}

const PaymentMethodView: FC = () => {
  const { setSidebarView } = useUI()

  async function handleSubmit(event: React.ChangeEvent<Form>) {
    event.preventDefault()

    setSidebarView('CHECKOUT_VIEW')
  }

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <SidebarLayout handleBack={() => setSidebarView('CHECKOUT_VIEW')}>
        <div className="px-4 sm:px-6 flex-1">
          <Text variant="sectionHeading"> Payment Method</Text>
          <div>
            <div className={s.fieldset}>
              <label className={s.label}>Cardholder Name</label>
              <input
                name="cardHolder"
                className={s.input}
                defaultValue="Jade Angelou"
              />
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-7')}>
                <label className={s.label}>Card Number</label>
                <input
                  name="cardNumber"
                  className={s.input}
                  defaultValue="1234 4567 9832 3912"
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-3')}>
                <label className={s.label}>Expires</label>
                <input
                  name="cardExpireDate"
                  className={s.input}
                  placeholder="MM/YY"
                  defaultValue="03/28"
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-2')}>
                <label className={s.label}>CVC</label>
                <input name="cardCvc" className={s.input} defaultValue="123" />
              </div>
            </div>
          </div>
        </div>
        <div className="sticky z-20 bottom-0 w-full right-0 left-0 py-12 bg-accent-0 border-t border-accent-2 px-6">
          <Button type="submit" width="100%" id="submit-cc" variant="ghost">
            Continue
          </Button>
        </div>
      </SidebarLayout>
    </form>
  )
}

export default PaymentMethodView
