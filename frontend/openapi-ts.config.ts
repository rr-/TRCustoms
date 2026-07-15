import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/schema.yaml",
  output: "./src/client",
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    "@hey-api/sdk",
    "@tanstack/react-query",
  ],
});
