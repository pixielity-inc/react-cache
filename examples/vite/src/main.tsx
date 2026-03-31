import "reflect-metadata";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Container } from "@abdokouta/react-di";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { AppModule } from "@/modules/app.module";
import "@/styles/globals.css";

// Initialize container BEFORE React renders
Container.configure()
  .withModule(AppModule)
  .withLogLevel(import.meta.env.DEV ? "debug" : "info")
  .withDefaultScope("Singleton")
  .build();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
