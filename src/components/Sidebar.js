import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { CrossIcon } from "../Icons";

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const navBarItems = [
    { lbl: "Dashboard", slug: "/" },
    {
      lbl: "Cryptocurrencies",

      slug: "/cryptocurrencies",
    },
    { lbl: "Blockchains", slug: "/blockchains" },
    { lbl: "Manage Users", slug: "/users" },
    { lbl: "Visitor Tracking", slug: "/tracking" },
    {
      lbl: "Transaction Details",

      slug: "/transaction",
    },
    {
      lbl: "Settings",

      slug: "/settings",
    }

  ];

  useEffect(async () => {
    document.body.addEventListener("click", () => {
      document.body.style.overflowY = "auto";
      setOpenSidebar(false);
    });
  }, []);

  return (
    <div
      className={`sidebar-s fixed rel anim ${openSidebar ? "show" : "hide"}`}
    >
      <div
        className={`side-block flex col anim ${openSidebar ? "show" : "hide"}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="hdr flex">
          <div
            className="icon-close "
            onClick={(e) => {
              setOpenSidebar(false);
            }}
          >
            <CrossIcon />
          </div>
        </div>
        <div>
          <div className="items flex aic flex-col">
            {navBarItems.map((item, index) => (
              <NavLink
                key={index}
                exact
                to={`${item.slug}`}
                className={`list-item flex `}
                onClick={(e) => {
                  setOpenSidebar(false);
                }}
              >
                <div className="li cfff font">{item.lbl}</div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
