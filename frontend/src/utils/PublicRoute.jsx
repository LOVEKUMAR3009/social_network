import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider'
import {  Navigate } from 'react-router-dom'

const PublicRoute = ({children}) => {
    const {isLoggedIn} = useContext(AuthContext)
  return !isLoggedIn ?(
    children
  ):(
    <Navigate to={'/dashboard'}/>
  )
}

export default PublicRoute