import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
        parserOptions: {
            project: "./tsconfig.json",
            ecmaFeatures: {
                modules: true
            }
        }
    },

    rules: {
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                "selector": "default",
                "format": ["camelCase"]
            },
            {
                "selector": "variable",
                "format": ["camelCase", "UPPER_CASE"]
            },
            {
                "selector": "parameter",
                "format": ["camelCase"],
                "leadingUnderscore": "allow"
            },
            {
                "selector": "memberLike",
                "modifiers": ["private"],
                "format": ["camelCase"],
                "leadingUnderscore": "require"
            },
            {
                "selector": "typeLike",
                "format": ["PascalCase"]
            },
            {
                "selector": "interface",
                "format": ["PascalCase"],
                "custom": {
                    "regex": "^I[A-Z]",
                    "match": false
                }
            },
            {
                "selector": "enum",
                "format": ["PascalCase"]
            }
        ],

        curly: ["error", "all"],
        eqeqeq: ["error", "always"],
        "no-throw-literal": "error",
        semi: ["error", "always"],
        quotes: ["error", "double"],
        "no-console": ["warn", { "allow": ["warn", "error"] }],
        "no-debugger": "warn",

        indent: ["error", 4],
        "max-len": ["warn", { "code": 120 }],
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "no-trailing-spaces": "error",
        "comma-dangle": ["error", "always-multiline"],

        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_"
        }],
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/explicit-member-accessibility": ["error", {
            "accessibility": "explicit"
        }],

        "no-var": "error",
        "prefer-const": "error",
        "no-unused-expressions": "error",
        
        "no-async-promise-executor": "error",
        "no-return-await": "error",
        "require-await": "error",

        "no-restricted-globals": ["error", "require"],
    },

    env: {
        "node": true,
        "es2022": true
    },

    globals: {
        "vscode": "readonly"
    },

    settings: {
        "import/resolver": {
            "typescript": {}
        }
    }
}];