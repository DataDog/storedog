import React, { FC } from 'react'
import s from './Quantity.module.css'
import { Cross, Plus, Minus } from '@components/icons'
import cn from 'clsx'
import { datadogRum } from '@datadog/browser-rum'
import type { CartLineItem } from '@customTypes/cart'

export interface QuantityProps {
  value: number
  increase: () => any
  decrease: () => any
  handleRemove: React.MouseEventHandler<HTMLButtonElement>
  handleChange: React.ChangeEventHandler<HTMLInputElement>
  max?: number
  item?: CartLineItem
}

const Quantity: FC<QuantityProps> = ({
  value,
  increase,
  decrease,
  handleChange,
  handleRemove,
  max = 6,
  item,
}) => {
  const handleRemoveWithTracking = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (item) {
      datadogRum.addAction('Remove Cart Item', {
        product: {
          id: item.id,
          name: item.name,
          variant: item.variant.name,
          price: item.variant.price,
          quantity: value,
        },
      })
    }
    handleRemove(e)
  }

  const handleIncreaseWithTracking = () => {
    if (item) {
      datadogRum.addAction('Increase Cart Item', {
        product: {
          id: item.id,
          name: item.name,
          variant: item.variant.name,
          price: item.variant.price,
          quantity: value,
          new_quantity: value + 1,
        },
      })
    }
    increase()
  }

  const handleDecreaseWithTracking = () => {
    if (item) {
      datadogRum.addAction('Decrease Cart Item', {
        product: {
          id: item.id,
          name: item.name,
          variant: item.variant.name,
          price: item.variant.price,
          quantity: value,
          new_quantity: value - 1,
        },
      })
    }
    decrease()
  }

  return (
    <div className="flex flex-row h-9">
      <button className={s.actions} onClick={handleRemoveWithTracking} data-dd-action-name="Remove Cart Item">
        <Cross width={20} height={20} />
      </button>
      <label className="w-full border-accent-2 border ml-2">
        <input
          className={s.input}
          onChange={(e) =>
            Number(e.target.value) < max + 1 ? handleChange(e) : () => {}
          }
          value={value}
          type="number"
          max={max}
          min="1"
          readOnly
        />
      </label>
      <button
        type="button"
        onClick={handleDecreaseWithTracking}
        className={s.actions}
        data-dd-action-name="Decrease Cart Item"
        style={{ marginLeft: '-1px' }}
        disabled={value <= 1}
      >
        <Minus width={18} height={18} />
      </button>
      <button
        type="button"
        onClick={handleIncreaseWithTracking}
        className={cn(s.actions)}
        data-dd-action-name="Increase Cart Item"
        style={{ marginLeft: '-1px' }}
        disabled={value < 1 || value >= max}
      >
        <Plus width={18} height={18} />
      </button>
    </div>
  )
}

export default Quantity
