import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './Pages/Landingpage.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import VerifyOtp from './Pages/VerifyOTP.jsx'
import ForgetPassword from './Pages/ForgetPassword.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import PMDashboard from './Pages/PMDashboard.jsx'
import CreateProject from './Pages/CreateProjects.jsx'
import ProjectList from './Pages/ProjectList.jsx'
import ProjectDetail from './Pages/ProjectDetail.jsx'


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
      <Route path="/pmdashboard" element={<PMDashboard />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
    </Routes>
  )
}

export default App
