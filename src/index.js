import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from './App';
// import { Suspense, lazy } from "react";
import reportWebVitals from "./reportWebVitals";
// import Loader from "./components/Loader";
// const App = lazy(async () => {
//   const [moduleExports] = await Promise.all([
//     import("./App"),
//     new Promise((resolve) => setTimeout(resolve, 3000)),
//   ]);
//   return moduleExports;
// });
import App from "./App";
import AuthContextProvider from "./context/AuthContext";
ReactDOM.render(
  <>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>

  </>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
