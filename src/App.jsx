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
import EditProject from './Pages/EditProject.jsx'
import CreateRisk from './Pages/CreateRisk.jsx'
import RiskDetails from "./Pages/RiskDetails.jsx";
import RiskEdit from "./Pages/RiskEdit.jsx";
import GlobalRiskList from './Pages/GlobalRiskList.jsx'
import ProjectTeam from './Pages/ProjectTeam.jsx'
import PMHeatmap from './Pages/PMHeatmap.jsx'
import PMReports from './Pages/PMReports.jsx'
import Profile from './Pages/Profile.jsx'
import TMProjects from "./Pages/TMProjects";



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
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/:id/edit" element={<EditProject />} />
      <Route path="/projects/:id/risks/create" element={<CreateRisk />} />
      <Route path="/risks/:id" element={<RiskDetails />} />
      <Route path="/risks/:id/edit" element={<RiskEdit />} />
      <Route path="/risks" element={<GlobalRiskList />} />
      <Route path="/projects/:id/team" element={<ProjectTeam />} />
      <Route path="/pm/heatmap" element={<PMHeatmap />} />
      <Route path="/pm/reports" element={<PMReports />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/tm/projects" element={<TMProjects />} />
    </Routes>
  )
}

export default App
