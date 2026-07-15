// Configures the generated hey-api client with the app's auth-aware fetch.
// Call once at startup, before any generated SDK function or query hook runs.
import { client } from "src/client/client.gen";
import { AuthService } from "src/services/AuthService";
import { createAuthFetch } from "src/services/authFetch";

export const configureApiClient = (): void => {
  client.setConfig({
    fetch: createAuthFetch(AuthService),
  });
};
