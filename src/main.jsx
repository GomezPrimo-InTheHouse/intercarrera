import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain="dev-udkdqj8i.us.auth0.com"
    clientId="mgXUIVlI6fHqOhI0L2TLCnaiv8ONFfY8"
    authorizationParams={{
      redirect_uri: window.location.origin, // http://localhost:5174
    }}
    cacheLocation="localstorage"
    useRefreshTokens={true}
  >
    <App />
  </Auth0Provider>
);
