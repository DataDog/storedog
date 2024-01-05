# Frontend service

## Description

The frontend services is a JavaScript application that uses the Next.js React framework. It includes it's own set of API routes, which are used to fetch data from the backend services.

The service is based off of the [Next.js commerce template](https://github.com/vercel/commerce/tree/v1) and uses the Spree framework package to communicate with the backend service.

## Datadog configuration

### RUM

**Configuration**
The frontend service is configured to use the [Datadog RUM](https://docs.datadoghq.com/real_user_monitoring/) agent. The agent is configured in the `_app.tsx` file.

TODO: Update RUM version in repo

**Global Context**
Every session to the application randomly selects a user from a list of users in the `/site/config/user_data.json` file to enrich RUM session data with user information.

TODO: Add custom actions to repo 

### Logs

TODO: Configure logging in API routes (add to repo)

### APM

TODO: Configure APM in API routes (add to repo)

## Code structure

### packages

The `packages` directory contains Node modules for different ecommerce solutions. This is remnant of the original template we used to build the service. The `spree` package is the only one that is used.

TODO: Remove unused packages and move `spree` package into main application

### site

This is the main application directory, which is written . It contains the following directories:

- `assets` - Contains some base theme stylesheet assets. (TODO: assess if we need to keep this directory or roll it into other directories (or remove entirely))
  
- `components` - This is the main directory for React components. It contains the following subdirectories:
  
  - `auth` - Contains components related to authentication, such as the login form.
  
  - `cart` - Contains components related to the cart that opens in the site's sidebar. This includes the cart itself, the cart item, and the cart's sidebar container.
    
    Styles are located in the `*.module.css` files.
    
  - `checkout` - Contains components related to the checkout process. This includes the checkout form, shipping view, the checkout page, and the checkout success page.
    
    It also includes a React context provider for the checkout process, which is used to store the current checkout state and share it among the components.
    
  - `common` - Contains components that are used throughout the application. This includes the application's header, footer, the main layout, among others.
    
    Noteable components include the `Ad` and `Discount` components that make requests to those respective services.
    
  - `icons` - Contains SVG icons that are used throughout the application.
    
  - `product` - Contains components related to different product views. This includes the product card, product list, product view, among others.
    
  - `ui` - Contains components that are used to build the application's UI. This includes the `Button`, `Input`, `Select`, among others. 
    
    These components do not contain any business logic and are used to build other components.

  - `wishlist` - Contains components related to the wishlist.

- `config` - Contains configuration files for the application. This includes the `user_data.json` file, which contains a list of users that are randomly selected to enrich RUM session data.

- `lib` - Contains utility functions that are used throughout the application.

- `pages` - Contains the application's pages. This includes the `api` directory, which contains the API routes that are used to fetch data from the backend services.

  Each page defined here maps to a route in the application. For example, the `pages/index.tsx` file maps to the `/` route.

- `public` - Contains static assets that are served by the application. This includes the `favicon.ico` file, which is the application's favicon.

- root-level files:

  - `.env.local` - Contains environment variables that are used by the application. Next.js requires that environment variables be prefixed with `NEXT_PUBLIC_` in order to be used in the browser. This file is not committed to the repository.

  - `.eslintrc` - Contains ESLint configuration for the application.

  - `.gitignore` - Files to ignore when committing code to the repository.

  - `.prettierignore` - Files to ignore when formatting code with Prettier.

  - `.prettierrc` - Prettier configuration.

  - `commerce-config.js` - Configures the application's connection to the backend service. (TODO: assess if we need to keep this file or roll it into other files)

  - `featureFlags.config.json` - Contains feature flags that are used by the application. 

  - `global.d.ts` - Contains global type definitions for the application.

  - `next-env.d.ts` - Contains type definitions for Next.js.

  - `next.config.js` - Contains configuration for Next.js.

  - `package.json` - Node package configuration for the application.

  - `postcss.config.js` - Contains configuration for PostCSS.

  - `tailwind.config.js` - Contains configuration for Tailwind CSS.

  - `tsconfig.json` - Contains TypeScript configuration for the application.

### root-level files

> TODO: Consider removing the monorepo configuration when moving Spree package into main application, as we won't need it anymore. The end result should be the contents of `site` directory taking over this directory.

- `.prettierignore` - Files to ignore when formatting code with Prettier
- `.prettierrc` - Prettier configuration
- `Dockerfile` - Dockerfile for building the application (TODO: create variation for built app)
- `package.json` - Node package configuration for the monorepo
- `turbo.json` - The Turbo configuration file for monorepo management

