import React from "react";
import { AuthContext } from "../contexts/authContext.jsx";
import "../style.scss";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api.js";
import { useContext } from "react";

console.log("API URL:", import.meta.env.VITE_API_URL);

const Login = () => {
  const [inputs, setInputs] = React.useState({
    username: "",
    password: "",
  });

  const [err, setErr] = React.useState(null);
  const [countdown, setCountdown] = React.useState(30);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      if (document.requestStorageAccess) {
        try {
          await document.requestStorageAccess();
          console.log("Storage access granted!");
        } catch (err) {
          console.log("Storage access denied:", err);
        }
      }

      navigate("/", { replace: true });
    } catch (err) {
      setErr(err.response.data);
    }
  };

  if (countdown > 0) {
    return (
      <div className="auth">
        <div className="loading">
          <h1>Please wait for the app to load...</h1>
          <p>Due to Render's free tier cold start, it may take up to {countdown} seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <h1>Login</h1>
      <form>
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          required
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Login</button>
        {err && <p>{err}</p>}
        <span>
          Don't you have an account? <Link to="/Register">Register</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
