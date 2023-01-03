import cn from 'clsx';
import s from './Layout.module.css';
import dynamic from 'next/dynamic';
import LoginView from '@components/auth/LoginView';
import { useUI } from '@components/ui/context';
import { Navbar, Footer } from '@components/common';
import ShippingView from '@components/checkout/ShippingView';
import CartSidebarView from '@components/cart/CartSidebarView';
import { Sidebar, Button, LoadingDots } from '@components/ui';
import PaymentMethodView from '@components/checkout/PaymentMethodView';
import CheckoutSidebarView from '@components/checkout/CheckoutSidebarView';
import OrderConfirmView from '@components/checkout/OrderConfirmView';
import { CheckoutProvider } from '@components/checkout/context';
import { MenuSidebarView } from '@components/common/UserNav';
import Discount from '@components/common/Discount';
import Ad from '@components/common/Ad';
import type { Page } from '@commerce/types/page';
import type { Category } from '@commerce/types/site';
import type { Link as LinkProps } from '../UserNav/MenuSidebarView';

const Loading = () => (
  <div className='w-80 h-80 flex items-center text-center justify-center p-3'>
    <LoadingDots />
  </div>
);

const dynamicProps = {
  loading: Loading,
};

const SignUpView = dynamic(() => import('@components/auth/SignUpView'), {
  ...dynamicProps,
});

const ForgotPassword = dynamic(
  () => import('@components/auth/ForgotPassword'),
  {
    ...dynamicProps,
  }
);

const FeatureBar = dynamic(() => import('@components/common/FeatureBar'), {
  ...dynamicProps,
});

const Modal = dynamic(() => import('@components/ui/Modal'), {
  ...dynamicProps,
  ssr: false,
});

interface Props {
  pageProps: {
    pages?: Page[];
    categories: Category[];
  };
}

const ModalView: React.FC<{ modalView: string; closeModal(): any }> = ({
  modalView,
  closeModal,
}) => {
  return (
    <Modal onClose={closeModal}>
      {modalView === 'LOGIN_VIEW' && <LoginView />}
      {modalView === 'SIGNUP_VIEW' && <SignUpView />}
      {modalView === 'FORGOT_VIEW' && <ForgotPassword />}
    </Modal>
  );
};

const ModalUI: React.FC = () => {
  const { displayModal, closeModal, modalView } = useUI();
  return displayModal ? (
    <ModalView modalView={modalView} closeModal={closeModal} />
  ) : null;
};

const SidebarView: React.FC<{
  sidebarView: string;
  closeSidebar(): any;
  links: LinkProps[];
}> = ({ sidebarView, closeSidebar, links }) => {
  return (
    <Sidebar onClose={closeSidebar}>
      {sidebarView === 'CART_VIEW' && <CartSidebarView />}
      {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
      {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
      {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />}
      {sidebarView === 'MOBILE_MENU_VIEW' && <MenuSidebarView links={links} />}
      {sidebarView === 'ORDER_CONFIRM_VIEW' && <OrderConfirmView />}
    </Sidebar>
  );
};

const SidebarUI: React.FC<{ links: LinkProps[] }> = ({ links }) => {
  const { displaySidebar, closeSidebar, sidebarView } = useUI();
  return displaySidebar ? (
    <SidebarView
      links={links}
      sidebarView={sidebarView}
      closeSidebar={closeSidebar}
    />
  ) : null;
};

const Layout: React.FC<Props> = ({
  children,
  pageProps: { categories = [], ...pageProps },
}) => {
  const navBarlinks = categories.slice(0, 2).map((c) => ({
    label: c.name,
    href: `/search/${c.slug}`,
  }));

  return (
    <div className={cn(s.root)}>
      <Navbar links={navBarlinks} />
      <Discount />
      <main className='fit'>{children}</main>
      <Ad />
      <Footer pages={pageProps.pages} />
      <ModalUI />
      <CheckoutProvider>
        <SidebarUI links={navBarlinks} />
      </CheckoutProvider>
    </div>
  );
};

export default Layout;
