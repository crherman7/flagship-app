import {register} from '@brandingbrand/flagship-app-router';

import App from './App';

register({
  routes: [
    {
      name: 'com.myApp.WelcomeScreen',
      Component: App,
      path: '/root',
      options: {
        topBar: {
          visible: false,
        },
      },
    },
  ],
});
