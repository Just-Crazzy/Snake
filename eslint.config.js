import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  // ─── Игнорируемые файлы ───
  globalIgnores([
    'dist/**',
    'node_modules/**',
    'coverage/**',
    '*config*',
    '*eslintrc*',
    'setup.*',
  ]),
  // ─── Prettier (первым — чтобы кастомные rules переопределяли) ───
  prettierRecommended,

  // ─── Базовые пресеты ───
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // React
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  // React Hooks
  reactHooks.configs.flat.recommended,

  // TypeScript-парсер
  {
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    settings: {
      // https://github.com/vercel/next.js/issues/89764?ysclid=mv0vjr886w455481340 - Bug ESLint v10
      react: { version: '19' },
      'import-x/resolver-next': [
        createTypeScriptImportResolver(),
      ],
    },
    plugins: {
      "import-x": importX,
    },
  },

  // Отключаем type-checked для .js файлов
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Правила
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2023,
        ...globals.node,
      },
    },
    rules: {
      // Контрольные правила
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'func-style': 'off',
      'no-ternary': 'off',
      'no-debugger': 'warn',
      'no-console': 'warn',
      'eqeqeq': ["error", "always"],
      "complexity": ["warn", 5],
      'max-statements': 'off',
      'sort-imports': 'off',
      'multiline-comment-style': ['error', 'separate-lines'],
      'prefer-const': 'error',
      'jsx-quotes': ['error', 'prefer-double'],

      // ─── Prettier ───
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          endOfLine: 'LF',
          singleQuote: true,
          quoteProps: 'as-needed',
          jsxSingleQuote: false,
          trailingComma: 'es5',
          bracketSpacing: true,
          bracketSameLine: false,
          arrowParens: 'always',
          proseWrap: 'preserve',
          htmlWhitespaceSensitivity: 'ignore',
          embeddedLanguageFormatting: 'auto',
          singleAttributePerLine: false,
        },
      ],

      // ─── TypeScript правила ───
      'no-restricted-globals': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', {
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports',
      }],
      '@typescript-eslint/consistent-type-exports': ['error', {
        fixMixedExportsWithInlineTypeSpecifier: false,
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false,
      }],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-type-alias': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/restrict-plus-operands': 'off',

      // ─── React правила ───
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-leaked-render': ['error', {
        validStrategies: ['coerce'],
      }],

      // ─── React Hooks ───
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ─── Import ───
      'import-x/no-unresolved': 'off',
      'import-x/no-self-import': 'error',
      'import-x/no-default-export': 'warn',
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          "newlines-between": "always-and-inside-groups",
          alphabetize: { order: "asc", caseInsensitive: true },
          named: true,
          warnOnUnassignedImports: true,

          pathGroups: [
            // React & Redux первые
            { pattern: "react**", group: "builtin", position: "before" },
            { pattern: "**redux**", group: "builtin", position: "after" },

            // ПЕРЕД internal (первым среди алиасов)
            { pattern: "@/app/**", group: "internal", position: "before" },

            // Внутри internal
            { pattern: "@/processes/**", group: "internal", position: "before" },
            { pattern: "@/pages/**", group: "internal", position: "before" },
            { pattern: "@/widgets/**", group: "internal", position: "before", },
            { pattern: "@/features/**", group: "internal", position: "before" },
            { pattern: "@/entities/**", group: "internal", position: "before" },

            // ПОСЛЕ internal (последним среди алиасов)
            { pattern: "@/shared/**", group: "parent", position: "before" },
            { pattern: "@/**", group: "parent", position: "before" },
            { pattern: "@public/**", group: "parent", position: "after" },
          ],
          pathGroupsExcludedImportTypes: [
            "builtin",
            ["external", "internal"],
            ["parent", "index", "sibling"],
            "object",
            "type",
          ],
        },
      ],
    },
  },

  ...compat.config({
    rules: {
      // Запрет deep imports
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/ui/*", "!@/shared/ui"],
              message: "Используйте родительский import: @/shared/ui",
            },
            {
              group: ["@/shared/lib/*", "!@/shared/lib"],
              message: "Используйте родительский import: @/shared/lib",
            },
            {
              group: ["@/entities/*/**"],
              message: "Используйте родительский import: @/entities/{entity}",
            },
            {
              group: ["@/features/*/**"],
              message: "Используйте родительский import: @/features/{feature}/{slice}",
            },
            {
              group: ["@/widgets/*/**"],
              message: "Используйте родительский import: @/widgets/{widget}",
            },
            {
              group: ["@/pages/*/**"],
              message: "Используйте родительский import: @/pages/{page}",
            },
          ],
        },
      ],
    },
  }),
  // ─── Override для .js файлов ───
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
