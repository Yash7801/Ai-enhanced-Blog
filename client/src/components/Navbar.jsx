import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/logo.png";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext.jsx";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);

  // 🌙 Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="Logo" />
          </Link>
        </div>

        <div className="links">

          {/* 🌙 Theme Toggle */}
          <span className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </span>

          {/* Categories */}
          <Link className="link nav-links" to="/?cat=art"><h5>Art</h5></Link>
          <Link className="link nav-links" to="/?cat=science"><h5>Science</h5></Link>
          <Link className="link nav-links" to="/?cat=technology"><h5>Technology</h5></Link>
          <Link className="link nav-links" to="/?cat=cinema"><h5>Cinema</h5></Link>
          <Link className="link nav-links" to="/?cat=design"><h5>Design</h5></Link>
          <Link className="link nav-links" to="/?cat=food"><h5>Food</h5></Link>

          {/* User */}
          <span className="current-user">👤 {currentUser?.username}</span>

          {currentUser ? (
            <span onClick={logout}>Logout</span>
          ) : (
            <Link className="link" to="/Login">Login</Link>
          )}

          {/* Write Button */}
          <span className="write">
            <Link className="link" to="/Context">Write</Link>
          </span>

        </div>
      </div>
    </div>
  );
};

export default Navbar;
