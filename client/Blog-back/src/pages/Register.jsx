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
  const navigate = useNavigate();

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