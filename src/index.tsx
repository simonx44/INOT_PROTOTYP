import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./state/store";
import reportWebVitals from "./reportWebVitals";
import "primereact/resources/themes/md-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.min.css"; // core css
import "primeicons/primeicons.css"; // icons
import "./dist/primeflex.scss";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
