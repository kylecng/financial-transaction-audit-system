module.exports = {
  root: true, // Prevent ESLint from looking for configuration files in parent directories
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  plugins: [
    '@typescript-eslint', // Plugin for TypeScript-specific rules
    'react', // Plugin for React-specific rules
    'react-hooks', // Plugin for React Hooks rules
    'prettier', // Runs Prettier as an ESLint rule
  ],
  extends: [
    'eslint:recommended', // ESLint recommended rules
    'plugin:@typescript-eslint/recommended', // TypeScript recommended rules
    'plugin:react/recommended', // React recommended rules
    'plugin:react-hooks/recommended', // React Hooks recommended rules
    'prettier', // Disables ESLint rules that conflict with Prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  env: {
    browser: true, // Enable browser global variables
    es2020: true, // Add global variables for ES2020
    node: true, // Enable Node.js global variables and Node.js scoping.
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js', // Ignore root config files like vite.config.js, tailwind.config.js etc.
    '*.config.ts',
    '.eslintrc.js', // Ignore this file itself
    '.prettierrc.js', // Ignore prettier config
    'client/components.json',
    'client/postcss.config.js',
    'client/tailwind.config.js',
    'client/vite.config.ts',
    'client/tsconfig*.json',
    'server/tsconfig.json',
    'server/prisma/migrations/',
  ],
  rules: {
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused variables, allowing underscores
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ and Vite/modern bundlers
    'react/prop-types': 'off', // Not needed when using TypeScript for prop types
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow inferred return types for functions
    // Add any project-specific rule overrides here
  },
  overrides: [
    // Server-specific configuration
    {
      files: ['server/**/*.ts'],
      env: {
        node: true,
        browser: false, // Server code doesn't run in the browser
      },
      rules: {
        // Add any server-specific rule overrides here
      },
    },
    // Client-specific configuration
    {
      files: ['client/**/*.ts', 'client/**/*.tsx'],
      env: {
        browser: true,
        node: false, // Client code primarily runs in the browser
      },
      rules: {
        // Add any client-specific rule overrides here
      },
    },
    // Configuration files (allow require)
    {
      files: ['*.js'], // Apply to root JS config files if any remain after ignores
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Allow require in JS config files
      },
    },
  ],
};
