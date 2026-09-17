import toolchainConfig from "@ongaku/toolchain/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [toolchainConfig],
    overrides: [
        {
            files: ["src/**/*"],
            env: { node: true },
        },
    ],
});
