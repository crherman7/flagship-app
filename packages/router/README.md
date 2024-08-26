# @brandingbrand/flagship-app-router

This project provides a flexible and extensible routing system for React Native applications using `react-native-navigation`. It includes utilities for registering routes, setting up the application's layout, and managing navigation within the app.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Registering Routes](#registering-routes)
  - [Creating Layouts](#creating-layouts)
  - [Using Hooks](#using-hooks)
    - [useRoute](#useroute)
    - [useModal](#usemodal)
    - [useComponentId](#usecomponentid)
    - [usePathParams](#usepathparams)
    - [useQueryParams](#usequeryparams)
    - [useRouteData](#useroutedata)
    - [useNavigator](#usenavigator)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the required packages:

```bash
npm install @brandingbrand/flagship-app-router react-native-navigation
```

## Usage

### Registering Routes

The `register` function is used to set up your app's routes and define the initial layout.

```typescript
import {register} from './router';
import HomeComponent from './screens/Home';
import ProfileComponent from './screens/Profile';

register({
  routes: [
    {path: '/home', name: 'HomeScreen', Component: HomeComponent},
    {
      path: '/profile',
      name: 'ProfileScreen',
      Component: ProfileComponent,
      options: {bottomTab: {text: 'Profile'}},
    },
  ],
  onAppLaunched: async () => {
    console.log('App launched');
  },
});
```

### Using Hooks

The router includes several custom hooks for managing navigation and accessing route data.

#### `useRoute`

Retrieves the current router state from the `RouterContext`.

```typescript
const route = useRoute();
```

#### `useModal`

Interacts with a modal's state within the context of a `ModalContext.Provider`.

```typescript
const {data, resolve, reject} = useModal<MyDataType, MyResultType>();
```

#### `useComponentId`

Accesses the current component ID from the `ComponentIdContext`.

```typescript
const componentId = useComponentId();
```

#### `usePathParams`

Retrieves URL parameters matched by the route's path.

```typescript
const params = usePathParams();
```

#### `useQueryParams`

Retrieves search parameters from the URL.

```typescript
const queryParams = useQueryParams();
```

#### `useRouteData`

Retrieves the router data for the current route.

```typescript
const data = useRouteData<MyDataType>();
```

#### `useNavigator`

Provides navigation functions for managing the component stack.

```typescript
const {push, pop, setStackRoot, showModal} = useNavigator();
```

## API Reference

### `register`

Registers routes and sets the root layout for the application.

**Parameters:**

- `routes`: Array of route definitions.
- `onAppLaunched`: Optional callback after the app is launched.
- `Provider`: Optional React component to be used as a provider.

### `createInitialLayout`

Creates the initial layout object for the application.

### `addBottomTabToLayout`

Adds a bottom tab to the root layout.

### `setRootLayout`

Sets the root layout for the application and registers the app launch listener.

### `useRoute`

Custom hook to access the Router context.

### `useModal`

Hook to interact with a modal's state.

### `useComponentId`

Custom hook to access the Component ID context.

### `usePathParams`

Custom hook to retrieve URL parameters matched by the route's path.

### `useQueryParams`

Custom hook to retrieve search parameters from the URL.

### `useRouteData`

Custom hook to retrieve the router data.

### `useNavigator`

Hook to provide navigation functions for managing the component stack.

## Examples

### Example 1: Basic Setup

```typescript
import {register} from './router';
import HomeComponent from './screens/Home';
import ProfileComponent from './screens/Profile';

register({
  routes: [
    {path: '/home', name: 'HomeScreen', Component: HomeComponent},
    {
      path: '/profile',
      name: 'ProfileScreen',
      Component: ProfileComponent,
      options: {bottomTab: {text: 'Profile'}},
    },
  ],
});
```

### Example 2: Using Hooks

```typescript
import React from 'react';
import {useRoute, useNavigator} from './hooks';

const MyComponent = () => {
  const {name, path} = useRoute();
  const {push, pop} = useNavigator();

  return (
    <View>
      <Text>Route: {name}</Text>
      <Text>Path: {path}</Text>
      <Button onPress={() => push('/next')} title="Next" />
      <Button onPress={pop} title="Back" />
    </View>
  );
};
```

Certainly! Here’s an updated section in your `README.md` that includes examples of using the `Provider` and route guards when registering routes.

### Example 3: Basic Setup with `Provider`

You can wrap your application with a custom `Provider` to manage state or provide context throughout the app. This is useful when you need to share data or functions across multiple components or routes.

```typescript
import {register} from './router';
import HomeComponent from './screens/Home';
import ProfileComponent from './screens/Profile';
import MyCustomProvider from './context/MyCustomProvider';

register({
  routes: [
    {path: '/home', name: 'HomeScreen', Component: HomeComponent},
    {
      path: '/profile',
      name: 'ProfileScreen',
      Component: ProfileComponent,
      options: {bottomTab: {text: 'Profile'}},
    },
  ],
  onAppLaunched: async () => {
    console.log('App launched');
  },
  Provider: MyCustomProvider, // Use the custom provider to wrap your application
});
```

### Example 4: Using Guards for Route Protection

Route guards allow you to control access to certain routes based on conditions like authentication, permissions, or feature flags. Guards can be async and can redirect to another route if access is denied.

```typescript
import {register} from './router';
import HomeComponent from './screens/Home';
import ProfileComponent from './screens/Profile';
import LoginComponent from './screens/Login';

const isAuthenticated = async () => {
  // Check if the user is authenticated
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};

register({
  routes: [
    {
      path: '/home',
      name: 'HomeScreen',
      Component: HomeComponent,
    },
    {
      path: '/profile',
      name: 'ProfileScreen',
      Component: ProfileComponent,
      options: {bottomTab: {text: 'Profile'}},
      guard: async ({path, navigate}) => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          // Redirect to login if not authenticated
          navigate('/login', {redirectTo: path});
        }
        return authenticated;
      },
    },
    {
      path: '/login',
      name: 'LoginScreen',
      Component: LoginComponent,
    },
  ],
});
```

### Example 5: Combining `Provider` with Guards

You can combine both a `Provider` and guards to create a highly customizable and protected application flow.

```typescript
import {register} from './router';
import HomeComponent from './screens/Home';
import ProfileComponent from './screens/Profile';
import LoginComponent from './screens/Login';
import AuthProvider, {useAuth} from './context/AuthProvider';

const isAuthenticated = async () => {
  // Example authentication check logic
  const {isLoggedIn} = useAuth();
  return isLoggedIn;
};

register({
  routes: [
    {
      path: '/home',
      name: 'HomeScreen',
      Component: HomeComponent,
    },
    {
      path: '/profile',
      name: 'ProfileScreen',
      Component: ProfileComponent,
      options: {bottomTab: {text: 'Profile'}},
      guard: async ({path, navigate}) => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          // Redirect to login if not authenticated
          navigate('/login', {redirectTo: path});
        }
        return authenticated;
      },
    },
    {
      path: '/login',
      name: 'LoginScreen',
      Component: LoginComponent,
    },
  ],
  Provider: AuthProvider, // Use the AuthProvider to manage authentication state
});
```

In this example:

- The `AuthProvider` provides authentication state and functions via context.
- The `isAuthenticated` guard checks if the user is logged in and, if not, redirects them to the login screen.
- The `Provider` ensures that all components within the app can access the authentication context.

## Contributing

Contributions are welcome! Please follow these guidelines:

- Fork the repository.
- Create a new branch (`git checkout -b feature-branch`).
- Make your changes.
- Commit your changes (`git commit -m 'Add some feature'`).
- Push to the branch (`git push origin feature-branch`).
- Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
