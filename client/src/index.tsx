
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "./store/index";
import Context from "./store/auth/context";
const getId : any = document.getElementById('root');
const root = ReactDOM.createRoot(getId);
import 'react-toastify/dist/ReactToastify.css';
root.render(
  <Provider store={configureStore({})}>
    <BrowserRouter>
    <Context>
      <App />
      </Context>
    </BrowserRouter>
  </Provider>
);

