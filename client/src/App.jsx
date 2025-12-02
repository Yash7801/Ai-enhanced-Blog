import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Context from "./pages/Context";
import Single from "./pages/Single";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./style.scss";
import React from "react";

// ⭐ NEW IMPORT
import ProtectedRoute from "./components/ProtectedRoute";

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    // ⭐ WRAP Layout with ProtectedRoute
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/context", element: <Context /> },
      { path: "/post/:id", element: <Single /> },
    ],
  },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
]);

function App() {
  return (
    <div className="App font-[Inter] bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
