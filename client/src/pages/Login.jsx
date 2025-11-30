import React from 'react'
import { AuthContext } from '../context/authContext.jsx';
import "../style.scss"
import { Link,useNavigate } from 'react-router-dom'
import axiosInstance from '../api.js'
import { useContext } from 'react'


console.log("API URL:", import.meta.env.VITE_API_URL);

const Login = () => {
  const [inputs,setInputs]=React.useState({
    username:"",
    password:""
  });

  const [err,setErr]=React.useState(null);
  const navigate = useNavigate();

  const {login}=useContext(AuthContext);
  

  const handleChange=e=>{
    setInputs(prev=>({...prev,[e.target.name]:e.target.value}))
  }

  const handleSubmit =async e=>{
    e.preventDefault()
    try{
      await login(inputs);
      navigate("/");
    } catch(err){
      setErr(err.response.data);
    }
  }
  return (
    <div className='auth'>
      <h1>Login</h1>
      <form>
        <input required type="text" placeholder='username' name='username' onChange={handleChange}/>
        <input required type="password" placeholder='password' name='password' onChange={handleChange}/>
        <button onClick={handleSubmit}>Login</button>
        {err && <p>{err}</p>}
        <span>Don't you have an account? <Link to="/Register">Register</Link>
        </span>
      </form>
    </div>
  )
}

export default Login