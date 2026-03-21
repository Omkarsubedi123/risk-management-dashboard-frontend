import axios from "axios";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const adminApi = {
  getDashboard: () => api.get("/users/admin/dashboard/"),
  getUsers: (params = {}) => api.get("/users/admin/users/", { params }),
  deactivatePM: (pm_id) => api.post("/users/admin/deactivate-pm/", { pm_id }),
  deletePM: (pm_id) => api.post("/users/admin/delete-pm/", { pm_id }),

  getPMList: () => api.get("/projects/admin/pms/"),
  getProjectsByPM: (pmId) => api.get(`/projects/admin/pms/${pmId}/projects/`),
  transferOwnership: (from_pm_id, to_pm_id) =>
    api.post("/projects/admin/transfer-ownership/", {
      from_pm_id,
      to_pm_id,
    }),
};

export default api;