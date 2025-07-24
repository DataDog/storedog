import { FC, useState, useEffect } from 'react'
import cn from 'clsx'

import Button from '@components/ui/Button'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import { useCheckoutContext } from '@components/checkout/context'

import s from './ShippingView.module.css'

import countryIsoCodes from '../../../config/country_iso_codes.json'

const ShippingView: FC = () => {
  const { setSidebarView } = useUI()
  const { addressFields, setAddressFields, addressStatus } =
    useCheckoutContext()

  const [formData, setFormData] = useState({
    firstname: addressFields.firstname || '',
    lastname: addressFields.lastname || '',
    email: addressFields.email || '',
    address1: addressFields.address1 || '',
    address2: addressFields.address2 || '',
    zipcode: addressFields.zipcode || '',
    city: addressFields.city || '',
    phone: addressFields.phone || '',
    state_name: addressFields.state_name || '',
    country_iso: addressFields.country_iso || 'US',
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

    const addressFields = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      address1: formData.address1,
      address2: formData.address2,
      zipcode: formData.zipcode,
      city: formData.city,
      phone: formData.phone,
      state_name: formData.state_name,
      country_iso: formData.country_iso,
    }

    setAddressFields(addressFields)
    setSidebarView('CHECKOUT_VIEW')
  }

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <SidebarLayout handleBack={() => setSidebarView('CHECKOUT_VIEW')}>
        <div className="px-4 sm:px-6 flex-1">
          <h2 className="pt-1 pb-8 text-2xl font-semibold tracking-wide cursor-pointer inline-block">
            Shipping
          </h2>
          {/* display error if there is one */}
          {addressStatus.ok === false && (
            <div className="text-red border border-red p-3 mb-3">
              {addressStatus.message}
            </div>
          )}
          <div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>First Name</label>
                <input
                  name="firstname"
                  className={s.input}
                  value={formData.firstname}
                  onChange={handleChange}
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Last Name</label>
                <input
                  name="lastname"
                  className={s.input}
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Email</label>
              <input
                name="email"
                className={s.input}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Phone</label>
              <input
                name="phone"
                className={s.input}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Address 1</label>
              <input
                name="address1"
                className={s.input}
                value={formData.address1}
                onChange={handleChange}
              />
            </div>
            <div className={s.fieldset}>
              <label className={s.label}>Address 2 (optional)</label>
              <input
                name="address2"
                className={s.input}
                value={formData.address2}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Postal Code</label>
                <input
                  name="zipcode"
                  className={s.input}
                  value={formData.zipcode}
                  onChange={handleChange}
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>City</label>
                <input
                  name="city"
                  className={s.input}
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-3 grid-flow-row grid-cols-12">
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>State</label>
                <input
                  name="state_name"
                  className={s.input}
                  value={formData.state_name}
                  onChange={handleChange}
                />
              </div>
              <div className={cn(s.fieldset, 'col-span-6')}>
                <label className={s.label}>Country/Region</label>
                <select
                  name="country_iso"
                  className={s.select}
                  value={formData.country_iso}
                  onChange={handleChange}
                >
                  {countryIsoCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky z-20 bottom-0 w-full right-0 left-0 py-12 bg-accent-0 border-t border-accent-2 px-6">
          <Button
            type="submit"
            width="100%"
            variant="ghost"
            id="submit-address"
          >
            Continue
          </Button>
        </div>
      </SidebarLayout>
    </form>
  )
}

export default ShippingView
