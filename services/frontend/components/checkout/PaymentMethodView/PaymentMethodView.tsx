import { FC, useState } from 'react'
import cn from 'clsx'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import { useCheckoutContext } from '@components/checkout/context'

import s from './PaymentMethodView.module.css'

const PaymentMethodView: FC = () => {
  const { setSidebarView } = useUI()
  const { cardFields, setCardFields, paymentStatus } = useCheckoutContext()

  const [formData, setFormData] = useState({
    name: cardFields.source_attributes.name || '',
    number: cardFields.source_attributes.number || '',
    month: cardFields.source_attributes.month || '',
    year: cardFields.source_attributes.year || '',
    verification_value: cardFields.source_attributes.verification_value || '',
  })

  function handleChange(event: React.ChangeEvent<any>) {
    const target = event.target
    const value = target.value
    const name = target.name

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  async function handleSubmit(event: React.ChangeEvent<any>) {
    event.preventDefault()

    const cardFields = {
      payment_method_id: '1',
      source_attributes: {
        name: formData.name,
        number: formData.number,
        month: formData.month,
        year: formData.year,
        verification_value: formData.verification_value,
        cc_type: 'visa',
      },
    }

    setCardFields(cardFields)

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
                value={formData.name}
                onChange={handleChange}
                placeholder="Jade Angelou"
              />
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-9')}>
                <label className={s.label}>Card Number</label>
                <input
                  name="cardNumber"
                  className={s.input}
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="4111111111111111"
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-3')}>
                <label className={s.label}>CVC</label>
                <input
                  name="cardCvc"
                  className={s.input}
                  value={formData.verification_value}
                  onChange={handleChange}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Expiry Month (mm)</label>
                <input
                  name="cardExpiryMonth"
                  className={s.input}
                  value={formData.month}
                  onChange={handleChange}
                  placeholder="01"
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Expiry Year (yyyy)</label>
                <input
                  name="cardExpireDate"
                  className={s.input}
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2027"
                />
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
