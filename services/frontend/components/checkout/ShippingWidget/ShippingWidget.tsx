import { FC } from 'react'
import s from './ShippingWidget.module.css'
import { ChevronRight, MapPin, Check } from '@components/icons'

interface ComponentProps {
  onClick?: () => any
  isValid?: boolean
}

const ShippingWidget: FC<ComponentProps> = ({ onClick, isValid }) => {
  return (
    <div onClick={onClick} className={s.root}>
      <div className="flex flex-1 items-center">
        <MapPin className="w-5 flex" />
        <span className="ml-5 text-sm text-center font-medium">
          Add Shipping Address
        </span>
      </div>
      {/* <div>{isValid ? <Check /> : <ChevronRight />}</div> */}
      <div>
        <ChevronRight />
      </div>
    </div>
  )
}

export default ShippingWidget
