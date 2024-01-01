import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { IconContext } from "react-icons";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import logo from "../assets/images/nav-logo.png";
import "../App.css";
import "./Navbar.css";


function Navbar({ contactRef }) {
  const [sidebar, setSidebar] = useState(false);
  const location = useLocation();

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: "undefined" }}>
        <div className="navbar">
          <Link to="/" className="navbar-logo">
            <img
              src={logo}
              alt="Logo"
              className="ml-4 w-[12rem]"
            />
          </Link>

          <Link to="#" className="menu-bars">
            <i onClick={showSidebar} className="fas fa-bars"></i>
          </Link>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <div className="nav-menu-container" onClick={showSidebar}>

<div className="logo-item">

           
              <Link to="/" className="navbar-active-logo">
                <img
                  src={logo}
                  alt="Logo"
                  className="ml-4 w-[14rem]"
                />
              </Link>
       


</div>

<ul className="nav-menu-items">
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>





            {SidebarData.map((item, index) => {
              return (
                <li
                  key={index}
                  className={
                    item.path === location.pathname
                      ? `${item.cName} active` // Add "active" class for the active link
                      : item.cName
                  }
                >
                  <Link to={item.path}>
                
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
    




</ul>
          </div>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
