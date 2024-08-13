import {FlagshipAppRouter} from '@brandingbrand/flagship-app-router';

import App from './App';

FlagshipAppRouter.register({
  routes: [
    {
      name: 'com.myApp.WelcomeScreen',
      Component: App,
      path: 'app://root',
      options: {
        topBar: {
          visible: false,
        },
      },
    },
  ],
});
