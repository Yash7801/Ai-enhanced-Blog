import React, { useState, useEffect, createContext } from "react";
import axiosInstance from "../api";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    console.log("Login function TRIGGERED");
    console.log("Axios Instance BaseURL:", axiosInstance.defaults.baseURL);

    const res = await axiosInstance.post("/api/auth/login", inputs, {
      withCredentials: true,
    });

    setCurrentUser(res.data);

    // ❌ REMOVE THIS (backend does not return a token)
    // if (res.data.token) {
    //   localStorage.setItem("token", res.data.token);
    // }

    // (cookie is already set by backend)
  };

  const logout = async () => {
    await axiosInstance.post(
      "/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    setCurrentUser(null);

    
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
