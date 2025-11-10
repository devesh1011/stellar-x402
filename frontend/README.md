# Stellar x402 Frontend# React + TypeScript + Vite

Modern web application showcasing the Stellar x402 payment protocol - built with Vite, React, TypeScript, and Tailwind CSS.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🎯 FeaturesCurrently, two official plugins are available:

### 🏠 Landing Page- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- Hero section with compelling value proposition- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- Feature highlights grid

- Quick installation instructions## React Compiler

- Responsive design with animations

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### 🎮 Interactive Demo

- Live payment flow demonstration## Expanding the ESLint configuration

- Two-column layout: API Response | Test Controls

- Real-time payment status updatesIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- Integration with `stellar-x402/client-axios`

````js

### 📚 Comprehensive Documentation Browserexport default defineConfig([

- Full markdown documentation with syntax highlighting  globalIgnores(['dist']),

- Sidebar navigation with collapsible sections  {

- Mobile-responsive with overlay menus    files: ['**/*.{ts,tsx}'],

- Previous/Next page navigation    extends: [

- Back to top button      // Other configs...

- All STELLAR-x402 docs ported and adapted for Stellar

      // Remove tseslint.configs.recommended and replace with this

## 🚀 Quick Start      tseslint.configs.recommendedTypeChecked,

      // Alternatively, use this for stricter rules

```bash      tseslint.configs.strictTypeChecked,

# Install dependencies      // Optionally, add this for stylistic rules

npm install      tseslint.configs.stylisticTypeChecked,



# Start frontend dev server      // Other configs...

npm run dev    ],

    languageOptions: {

# Start backend API server (in another terminal)      parserOptions: {

npm run dev:server        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

# Build for production      },

npm run build      // other options...

```    },

  },

## 📁 Project Structure])

````

````

frontend/You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

├── public/docs/        # Markdown documentation

├── src/```js

│   ├── components/     # Reusable UI components// eslint.config.js

│   ├── pages/          # Page componentsimport reactX from 'eslint-plugin-react-x'

│   ├── lib/            # Utilitiesimport reactDom from 'eslint-plugin-react-dom'

│   └── App.tsx         # Main app with routing

├── server.ts           # Express backendexport default defineConfig([

└── package.json  globalIgnores(['dist']),

```  {

    files: ['**/*.{ts,tsx}'],

## 🔧 Tech Stack    extends: [

      // Other configs...

- **Vite** - Fast build tool      // Enable lint rules for React

- **React 18 + TypeScript** - UI framework      reactX.configs['recommended-typescript'],

- **Tailwind CSS** - Styling      // Enable lint rules for React DOM

- **React Router** - Routing      reactDom.configs.recommended,

- **React Markdown** - Docs rendering    ],

- **stellar-x402** - Payment integration    languageOptions: {

      parserOptions: {

## 📝 License        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

MIT - Built with ❤️ for Stellar      },

      // other options...
    },
  },
])
````
