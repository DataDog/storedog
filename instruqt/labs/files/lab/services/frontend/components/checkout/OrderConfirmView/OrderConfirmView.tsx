import { FC } from 'react';
import { Text } from '@components/ui';
import { useUI } from '@components/ui/context';
import SidebarLayout from '@components/common/SidebarLayout';

const OrderConfirmView: FC = () => {
  const { setSidebarView } = useUI();

  return (
    <div>
      <SidebarLayout handleBack={() => setSidebarView('CHECKOUT_VIEW')}>
        <div className='px-4 sm:px-6 flex-1 purchase-confirmed-msg'>
          <Text variant='sectionHeading'> Thank you for your purchase!</Text>
        </div>
      </SidebarLayout>
    </div>
  );
};

export default OrderConfirmView;
