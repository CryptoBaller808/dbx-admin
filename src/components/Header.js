import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { DropDownIcon, MenuIcon, BallIcon } from "../Icons";
import { useAuthContext } from "../context/AuthContext";
const Header = ({ openSidebar, setOpenSidebar }) => {

  const { currentUser, logout } = useAuthContext();
  const menuRef = useRef();
  const avatarRef = useRef();
  const [isMenu, setIsMenu] = useState(false);
  const navigate = useNavigate();

  const navList = [
    { id: 1, title: "Home", slug: "/", icon: "" },
    { id: 2, title: "Buy/Sell", slug: "/buy", icon: "" },
    { id: 3, title: "Exchange", slug: "/exchange", icon: "" },
    { id: 4, title: "Swap", slug: "/swap", icon: "" },
    { id: 5, title: "NFT", slug: "/nft", icon: "" },
    { id: 6, title: "Orders", slug: "/orders", icon: <DropDownIcon /> },
    { id: 7, title: "DBX Coin", slug: "/dbx-coin", icon: "" },
    { id: 8, title: "DBX Card", slug: "/dbx-card", icon: "" },
  ];


  const handleOpenMenu = () => {
    if(currentUser){
      setIsMenu(!isMenu);
    }
  }

  // if(menuRef.current && isMenu){
    document.addEventListener('click', (e) => {
      if(isMenu && !avatarRef.current.contains(e.target)){
        setIsMenu(false);
      }
    })
  // }

  const handleChangePassword = () => {
    navigate('/change-password');
    setIsMenu(!isMenu);
  }



  useEffect(() => {
    console.log(isMenu);
  }, [isMenu])


  if (!currentUser) {
    return (
      <div className="header-cmp flex aic">
        <div className="wrapWidth wrap flex aic">
          <div className="left flex aic">
            <div className="logo flex aic jc">
              <img src="./images/DBX_Logo.svg" className="logo-img" />
            </div>
            <div className="welcome flex  flex-col">
              {/* <div className="wel-tag">Login</div> */}
            </div>
          </div>
          <div className="right flex aic">
          <div className="user-info flex aic">
            <img src="./images/user.png" className="u-img" />
            <div className="user-meta flex flex-col">
              {/* <div className="name">Login</div> */}
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="header-cmp flex aic">
      <div className="wrapWidth wrap flex aic">
        <div className="left flex aic">
          <div className="logo flex aic jc">
            <img src="./images/DBX_Logo.svg" className="logo-img" />
          </div>
          <div className="welcome flex  flex-col">
            <div className="wel-tag">Hello Admin,</div>
            <div className="welback-tag">Welcome back!</div>
          </div>
        </div>
        <div className="right flex aic">
          <div
            className="menu-icon"
            onClick={(e) => {
              console.log("clcik");
              setOpenSidebar(!openSidebar);
              e.stopPropagation();
            }}
          >
            <MenuIcon />
          </div>
          <div className="notification-ball rel">
            {/* <BallIcon /> */}
            {/* <div className="noti-numb flex aic jc abs">1</div> */}
          </div>
          <div className="user-info flex aic" >
            {<div className={`hover-menu ${isMenu ? "menu-show" : ""}`} ref={menuRef}>
              <div className="hover-menu-item" onClick={handleChangePassword}><p>Change Password</p></div>
              <div className="hover-menu-item" onClick={logout}><p>Logout</p></div>
            </div>}
            <img src="./images/user.png" className="u-img" ref={avatarRef} onClick={handleOpenMenu}/>
            {/* <div className="user-meta flex flex-col">
              <div className="name">Robert Fox</div>
              <div className="desi">Admin</div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
