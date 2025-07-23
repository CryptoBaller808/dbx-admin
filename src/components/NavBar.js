import React, { useState, useEffects } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  DashboardIcon,
  CryptoIcon,
  BlockCaIcon,
  UsersIcon,
  TrackingIcon,
  TransIcon,

} from "../Icons";
import TokenIcon from "../Icons/TokenIcon";
import BannerIcon from "../Icons/BannerIcon";
import { useAuthContext } from "../context/AuthContext";
import Setting from "../Icons/Setting";
const NavBar = () => {

  const { currentUser } = useAuthContext();

  const navBarItems = [
    { lbl: "Dashboard", icon: <DashboardIcon />, slug: "/" },
    {
      lbl: "Cryptocurrencies",
      icon: <CryptoIcon />,
      slug: "/cryptocurrencies",
    },
    { lbl: "Blockchains", icon: <BlockCaIcon />, slug: "/blockchains" },
    { lbl: "Token Manager", icon: <TokenIcon />, slug: "/tokens" },
    { lbl: "Banner Manager", icon: <BannerIcon />, slug: "/banners" },
    { lbl: "Manage Users", icon: <UsersIcon />, slug: "/users" },
    { lbl: "Visitor Tracking", icon: <TrackingIcon />, slug: "/tracking" },
    {
      lbl: "Transaction Details",
      icon: <TransIcon />,
      slug: "/transaction",
    },
    {
      lbl: "Settings",
      icon: <Setting />,
      slug: "/settings",
    },
  ];
  const ReFreshPage = () => {
    window.location.reload();
  };


  if (!currentUser) {
    return (
      <div className="navbar flex jc">
        <div className="wrap flex  flex-col">
          <div className="logo flex aic jc">
            <img src="./images/DBX_Logo.svg" className="logo-img" />
          </div>
          <div className="nav-list flex flex-col">

          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="navbar flex jc">
      <div className="wrap flex  flex-col">
        <div className="logo flex aic jc">
          <img src="./images/DBX_Logo.svg" className="logo-img" />
        </div>
        <div className="nav-list flex flex-col">
          {navBarItems.map((item, index) => (
            <NavLink
              key={index}
              exact
              to={`${item.slug}`}
              className={`list-item flex `}
            >
              <div className="select flex aic">
                <div className="ico">{item.icon}</div>
                <div className="lbl">{item.lbl}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
