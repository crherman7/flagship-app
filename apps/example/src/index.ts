import {register} from '@brandingbrand/flagship-app-router';
import {env, setEnv, envs} from '@brandingbrand/flagship-app-env';

import assets from './assets';

register({
  routes: [
    {
      name: 'home',
      Component: require('./routes/home').default,
      path: '/home',
      options: {
        topBar: {
          visible: false,
        },
        bottomTab: {
          icon: assets.home,
          text: 'Home',
        },
      },
    },
    {
      name: 'shop',
      Component: require('./routes/shop').default,
      path: '/shop',
      options: {
        topBar: {
          visible: false,
        },
        bottomTab: {
          icon: assets.shop,
          text: 'Shop',
        },
      },
    },
    {
      name: 'cart',
      Component: require('./routes/cart').default,
      path: '/cart',
      options: {
        topBar: {
          visible: false,
        },
        bottomTab: {
          icon: assets.bag,
          text: 'Cart',
        },
      },
    },
    {
      name: 'account',
      Component: require('./routes/account').default,
      path: '/account',
      options: {
        topBar: {
          visible: false,
        },
        bottomTab: {
          icon: assets.account,
          text: 'Account',
        },
      },
    },
    {
      name: 'applyDiscount',
      path: '/cart/discount/:discount',
      action: require('./routes/cart.discount.$discount').default,
    },
  ],
});
