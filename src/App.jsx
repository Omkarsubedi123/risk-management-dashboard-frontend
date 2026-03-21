import React from "react";
import { Route, Routes } from "react-router-dom";

import LandingPage from "./Pages/Landingpage.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import VerifyOtp from "./Pages/VerifyOTP.jsx";
import ForgetPassword from "./Pages/ForgetPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";

import PMDashboard from "./Pages/PMDashboard.jsx";
import CreateProject from "./Pages/CreateProjects.jsx";
import ProjectList from "./Pages/ProjectList.jsx";
import ProjectDetail from "./Pages/ProjectDetail.jsx";
import EditProject from "./Pages/EditProject.jsx";
import CreateRisk from "./Pages/CreateRisk.jsx";
import RiskDetails from "./Pages/RiskDetails.jsx";
import RiskEdit from "./Pages/RiskEdit.jsx";
import GlobalRiskList from "./Pages/GlobalRiskList.jsx";
import ProjectTeam from "./Pages/ProjectTeam.jsx";
import PMHeatmap from "./Pages/PMHeatmap.jsx";
import PMReports from "./Pages/PMReports.jsx";
import Profile from "./Pages/Profile.jsx";

import TMProjects from "./Pages/TMProjects";
import TMRisks from "./Pages/TMRisks";
import TMCreateRisk from "./Pages/TMCreateRisk";
import TMRiskDetails from "./Pages/TMRiskDetails";
import TMProjectDetail from "./Pages/TMProjectDetails.jsx";
import TMDashboard from "./Pages/TMDashboard.jsx";
import TMReport from "./Pages/TMReport.jsx";

import AdminDashboard from "./Pages/AdminDashboard.jsx";
import AdminUsers from "./Pages/AdminUsers.jsx";
import AdminTransferOwnership from "./Pages/AdminTransferOwnership.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
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
      <Route path="/tm/risks" element={<TMRisks />} />
      <Route path="/tm/risks/create" element={<TMCreateRisk />} />
      <Route path="/tm/risks/:id" element={<TMRiskDetails />} />
      <Route path="/tm/projects/:id" element={<TMProjectDetail />} />
      <Route path="/tm/dashboard" element={<TMDashboard />} />
      <Route path="/tm/report" element={<TMReport />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/transfer"
        element={
          <AdminRoute>
            <AdminTransferOwnership />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;