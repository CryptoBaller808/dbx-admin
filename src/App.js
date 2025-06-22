/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Web3 from "web3";
import axios from "axios";

import "./App.css";
import "./css/App.scss";

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Main from "./Pages/Main";
import CryptoCurrencies from "./Pages/CryptoCurrencies";
import Blockchains from "./Pages/Blockchains";
import ManageUsers from "./Pages/ManageUsers";
import TransactionDetails from "./Pages/TransactionDetail";
import Tracking from "./Pages/Tracking";

import NavBar from "./components/NavBar";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./Pages/Login";
import { useAuthContext } from "./context/AuthContext";
import 'react-toastify/dist/ReactToastify.css';
import 'react-responsive-pagination/themes/classic.css';
import { ProtectedRoute } from "./protectedRoute/ProtectedRoute";
import ChangePassword from "./Pages/ChangePassword";
import jwt from "jsonwebtoken";
import Settings from "./Pages/Settings";


function App() {
  const [openSidebar, setOpenSidebar] = useState(false);

  const { currentUser } = useAuthContext();

  // verify jwt expiry
  const handleJwtExpiry = () => {
    let decodedToken = jwt.decode(currentUser, { complete: true });
    let dateNow = new Date();
  }


  useEffect(() => {
    handleJwtExpiry();
  }, [])



  return (
    <div className="App flex">
      <BrowserRouter>
        <div className="flex app-pages">
          <div className="sidebar flex">
            <NavBar />
          </div>
          <div className="main-pages flex h-full flex-col flex-1">
            <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
            <Sidebar
              openSidebar={openSidebar}
              setOpenSidebar={setOpenSidebar}
            />
            <Routes>
              <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/" element={<Main />} exact />
                <Route
                  path="/cryptocurrencies"
                  element={<CryptoCurrencies />}
                  exact
                />
                <Route path="/blockchains" element={<Blockchains />} exact />
                <Route path="/users" element={<ManageUsers />} exact />
                <Route
                  path="/transaction"
                  element={<TransactionDetails />}
                  exact
                />
                <Route path="/tracking" element={<Tracking />} exact />
                <Route path="/settings" element={<Settings />} exact />
              </Route>

            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
