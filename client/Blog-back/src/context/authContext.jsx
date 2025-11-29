import React, { useState, useEffect, createContext } from "react";
import axiosInstance from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    const res = await axiosInstance.post("http://localhost:5200/api/auth/login", inputs,{withCredentials:true});
    setCurrentUser(res.data);

    // Save token separately
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
  };

  const logout = async () => {
    await axiosInstance.post("http://localhost:5200/api/auth/logout",{},{withCredentials:true});
    setCurrentUser(null);
    localStorage.removeItem("token"); // remove token on logout
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
