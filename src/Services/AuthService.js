import { createAuth0Client } from "@auth0/auth0-spa-js";

let auth0 = null;

export const initAuth = async () => {
  auth0 = await createAuth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    cacheLocation: "localstorage",
    useRefreshTokens: true,
  });
  return auth0;
};

export const getAuthClient = () => auth0;
