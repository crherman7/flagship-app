import App from './App';
import {FlagshipAppRouter} from '@brandingbrand/flagship-app-router';

FlagshipAppRouter.register({
  routes: [
    {
      name: 'com.myApp.WelcomeScreen',
      Component: App,
      path: 'app://root/',
      options: {
        topBar: {
          visible: false,
        },
      },
    },
  ],
});
