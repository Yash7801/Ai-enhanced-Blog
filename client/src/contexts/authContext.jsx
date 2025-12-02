import React, { useState, useEffect, createContext } from "react";
import axiosInstance from "../api";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  /* ============================
         LOGIN
  ============================ */
  const login = async (inputs) => {
    const res = await axiosInstance.post("/api/auth/login", inputs, {
    });

    // Backend returns user (without password)
    setCurrentUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  /* ============================
         LOGOUT
  ============================ */
  const logout = async () => {
    await axiosInstance.post(
      "/api/auth/logout",
      {},
      { withCredentials: true }
    );

    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  /* ============================
         SYNC WITH LOCALSTORAGE
  ============================ */
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
