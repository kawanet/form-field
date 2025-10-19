import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {OutputOptions, RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/**/*.ts",

    output: {
        file: "../build/test.browser.js",
        format: "iife",
        globals: {
            "form-field": "{formField}",
            "html-ele": "ele",
            "node:assert": "{strict: assert}",
            "node:test": "{describe, it, before, after}",
        },
    },

    external: [
        "form-field",
        "html-ele",
        "jsdom",
        "node:assert",
        "node:test",
    ],

    treeshake: false,

    plugins: [
        multiEntry(),

        alias({
            entries: [
                {find: /^.*\/src\/index.[jt]s$/, replacement: "form-field"},
            ],
        }),

        {
            name: "replace-dynamic-import",
            transform(source) {
                if (source.includes("await import")) {
                    const globals = (rollupConfig.output as OutputOptions).globals
                    const code = source.replace(
                        /\bawait\s+import\s*\(\s*(["'`])(html-ele)\1\s*\)/g,
                        ($0, $1, $2: keyof typeof globals) => (globals[$2] || $0),
                    )
                    if (code !== source) return {code, map: null}
                }
            },
        },

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
