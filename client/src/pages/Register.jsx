import React from 'react'
import "../style.scss"
import { Link,useNavigate } from 'react-router-dom'
import axiosInstance from '../api'

const Register = () => {
  const [inputs,setInputs]=React.useState({
    username:"",
    email:"",
    password:""
  });

  const [err,setErr]=React.useState(null);
  const [countdown, setCountdown] = React.useState(30);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange=e=>{
    setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
  }

  const handleSubmit =async e=>{
    e.preventDefault()
    try{
      await axiosInstance.post("/api/auth/register", inputs);
      navigate("/Login");
    } catch(err){
      setErr(err.response.data);
    }
  }

  if (countdown > 0) {
    return (
      <div className='auth'>
        <div className="loading">
          <h1>Please wait for the app to load...</h1>
          <p>Due to Render's free tier cold start, it may take up to {countdown} seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='auth'>
      <h1>Register</h1>
      <form>
        <input required type="text" placeholder='username' name='username' onChange={handleChange}/>
        <input required type="email" placeholder='email' name='email' onChange={handleChange}/>
        <input required type="password" placeholder='password' name='password' onChange={handleChange}/>
        <button onClick={handleSubmit}>Register</button>
        {err && <p>{err}</p>}
        <span>Do you have an account? <Link to="/Login">Login</Link>
        </span>
      </form>
    </div>
  )
}

export default Register;