import { defineConfig } from "oxlint";

export default defineConfig({
    plugins: ["typescript", "react", "react-hooks", "import", "unicorn"],
    categories: {
        correctness: "error",
        suspicious: "warn",
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/jsx-max-depth": "off",
        "unicorn/prefer-global-this": "off",
        "unicorn/filename-case": "off",
        "unicorn/consistent-function-scoping": "off",
        "func-style": "off",
        "import/no-unassigned-import": [
            "error",
            {
                allow: [
                    "**/*.css",
                    "**/*.scss",
                    "**/*.less",
                    "**/*.vue",
                    "**/*.svelte",
                ],
            },
        ],
        "no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
    },
});
