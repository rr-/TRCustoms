import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/schema.yaml",
  output: "./src/client",
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    "@hey-api/sdk",
    // The @tanstack/react-query plugin is intentionally not generated. Its
    // queryOptions builders only pay off when components consume the generated
    // snake_case types directly, but we deliberately go through the hand-rolled
    // services layer (throwOnError, camelCase payloads, query mapping) and a
    // central query-key module (src/services/queryKeys.ts). Keeping both stacks
    // meant maintaining ~80KB of unused output; see the data-fetching cleanup.
  ],
});
