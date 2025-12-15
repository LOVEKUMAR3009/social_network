import React, { useEffect, useState } from "react";

import Profile from "./Profile";
import AddPost from "./AddPost";
import Posts from "./Posts";
import axiosInstance from "../utils/axiosInstance";


const DashBoard = () => {
  const [posts,setPosts] = useState([])
  const getPosts = async()=>{
    try{
      const response = await axiosInstance.get("/posts")

      if(response.status===200){
        console.log("dash",response.data)
        setPosts(response.data)
      }
    }catch(error){
      console.log(error)
    }
  }
  useEffect(()=>{
    getPosts()
  },[])
  

  const handlelogut = async()=>{
    try{
      const token = localStorage.getItem("refreshToken")
      const data = {
        token,
      }
      console.log("Logout starting")
      const response = await axiosInstance.post('logout/',data)
      if(response.status === 200){
        // alert("logged out")
        localStorage.clear()
        console.log("befoare navigate")
        // window.href
        window.location.href = "/login";
        // navigate("/login", { replace: true })
        console.log("after navigate")
      }
    }catch(error){
      console.log(error.response.data)
      // alert("try again not logged out")
    }
  }
  return (
    // main stays full screen
    <main className="h-screen w-screen flex flex-col sm:flex-row">

      {/* left column */}
      <section className="flex flex-col sm:pl-6 lg:pl-0 mx-auto max-w-max sm:w-[35%] lg:w-[30%] justify-between sm:items-center">
        <div>

        <header className="text-2xl w-full pl-0.5 pt-3 pb-1 text-start md:text-lg lg:text-2xl">
          Social Network
        </header>
        <div className="w-full sm:max-w-[250px] max-sm:mb-5 sm:mr-5 items-center justify-center">
          <Profile />
        </div>
        </div>
        <button onClick={handlelogut} className="w-[50%] rounded p-2 sm:mb-4 bg-gray-500 active:bg-gray-300 cursor-pointer">Logout</button>
      </section>
      
      <section
        className="flex flex-col sm:flex-row sm:w-[65%] lg:w-[70%]
                   p-10 sm:overflow-y-auto  min-h-0">

        <div className="flex flex-col flex-1 items-start gap-6 w-full">
          <div className="w-full">
            <AddPost getposts={getPosts}/>
          </div>

          <div className="w-full">
            {
              posts.map((post)=>(
                <Posts key={post.id} postId={post.id} getPosts={getPosts} post = {post}/>
              ))
            }
          </div>  
        </div>
      </section>
    </main>
  )
};

export default DashBoard;
