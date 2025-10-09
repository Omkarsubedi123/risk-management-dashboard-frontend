import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './Pages/Landingpage.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import VerifyOtp from './Pages/VerifyOTP.jsx'
import ForgetPassword from './Pages/ForgetPassword.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/about" element={<LandingPage />} />
      <Route path="/contactus" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
