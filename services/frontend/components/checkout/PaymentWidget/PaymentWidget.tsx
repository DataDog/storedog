import { FC } from 'react'
import s from './PaymentWidget.module.css'
import { ChevronRight, CreditCard, Check } from '@components/icons'

interface ComponentProps {
  onClick?: () => any
  isValid?: boolean
  id?: string
}

const PaymentWidget: FC<ComponentProps> = ({ onClick, isValid, id }) => {
  return (
    <button 
      onClick={onClick} 
      className={s.root}
      id={id}
      type="button"
    >
      <div className="flex flex-1 items-center">
        <CreditCard className="w-5 flex" />
        <span className="ml-5 text-sm text-center font-medium">
          Add Payment Method
        </span>
        {/* <span>VISA #### #### #### 2345</span> */}
      </div>
      <div>{isValid ? <Check /> : <ChevronRight />}</div>
      {/* <div>
        <ChevronRight />
      </div> */}
    </button>
  )
}

export default PaymentWidget
