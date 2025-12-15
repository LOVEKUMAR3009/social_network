import { Routes,Route } from 'react-router-dom'
import '../src/styles/style.css'
import Signup from './components/Signup'
import Login from './components/Login'
import PrivateRoute from './utils/PrivateRoute'
import DashBoard from './components/DashBoard'
import PublicRoute from './utils/PublicRoute'
import Profile from './components/Profile'
import { useContext } from 'react'
import { AuthContext } from './context/AuthProvider'
import UpdateProfile from './components/UpdateProfile'


function App() {
  const {user} = useContext(AuthContext)
  return (
      <>
          
          <Routes>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/signup' element={<PublicRoute><Signup/></PublicRoute>}/>
            
            <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path='/dashboard' element={<PrivateRoute><DashBoard /></PrivateRoute>}/>     
            <Route path='/update' element={<PrivateRoute><UpdateProfile /></PrivateRoute>}/>     
          </Routes>
      </>
  )
}

export default App
