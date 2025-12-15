
import React, { useContext, useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthProvider";
const Login = () => {
  const{setIsLoggedIn,setUser,user}  = useContext(AuthContext)
  const navigate = useNavigate()
  const [email,setEamil] = useState('')
   const [password, setPassword] = useState("");
   const [error, setError] = useState({});
  const handlenavigation = ()=>{
      navigate('/signup')
  }
  const handleLogin = async(e)=>{
     e.preventDefault();
    const userData = {
      email,password
    }

    try{
      const response = await axiosInstance.post('/login/',userData)
      // console.log(response)
      
      localStorage.setItem("accessToken",response.data.tokens['access'])
      localStorage.setItem("refreshToken",response.data.tokens['refresh'])
      setIsLoggedIn(true)
      setUser({
        email:response.data.user.email,
        full_name:response.data.user.full_name,
        date_of_birth : response.data.user.date_of_birth,
        profile_picture :response.data.user.profile_picture

      })
      
      // console.log(user)
      navigate('/dashboard')
    }catch(error){
        setError(error.response.data)
    }

  }
  return (
    <>
      <div className="min-h-screen w-full  bg-gray-200">
        <div className="text-center p-5 text-3xl font-bold">
          <h1>Social Network Login</h1>
        </div>
        <div className="flex  justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[500px]">
            {/* Signup Form */}
            <form onSubmit={handleLogin} className="mt-5">
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email Address
                </label>

                <input
                  type="text"
                  id="email"
                  onChange={(e) => setEamil(e.target.value)}
                  value={email}
                  required
                  placeholder="Email"
                  className="border bg-gray-200 w-full p-2 rounded focus:outline-blue-200"
                />
              </div>

              <div className="w-full mb-5 mt-7  justify-between ">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  required
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="border border-gray-700/50 bg-gray-200  w-full p-2 rounded focus:outline-blue-200"
                />
              </div>
              <button type="submit" className="w-full mt-2 bg-blue-600 text-white p-2 rounded-2xl hover:bg-blue-700">
                Login
              </button>
            </form>

            <div className="text-center mt-4">
            <p className="text-sky-400 text-xs">
              Don't have account?{" "}
              <span onClick={handlenavigation} className="text-sm ext-sky-400 underline hover:cursor-pointer">
                Create Account
              </span>
            </p>
          </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Login;
