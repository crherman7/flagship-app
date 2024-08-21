import React from 'react';
import {register} from '@brandingbrand/flagship-app-router';
import {DevMenu} from '@brandingbrand/flagship-app-env';

/**
 * Importing screens from subpackages to avoid unnecessary dependencies.
 *
 * The `AsyncStorage` and `SensitiveInfo` screens are imported from their respective subpackages
 * within `@brandingbrand/flagship-app-env`. This approach allows you to include these screens
 * in your project without requiring you to install the underlying `react-native-*` packages unless
 * you actually use these screens. By importing them this way, you can keep your project lean
 * and avoid unnecessary dependencies.
 *
 * @example
 * import { AsyncStorage } from '@brandingbrand/flagship-app-env/screens/AsyncStorage';
 * import { SensitiveInfo } from '@brandingbrand/flagship-app-env/screens/SensitiveInfo';
 */
import {AsyncStorage} from '@brandingbrand/flagship-app-env/screens/AsyncStorage';
import {SensitiveInfo} from '@brandingbrand/flagship-app-env/screens/SensitiveInfo';

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
  Provider: ({children}) => (
    <DevMenu screens={[AsyncStorage, SensitiveInfo]}>{children}</DevMenu>
  ),
});
