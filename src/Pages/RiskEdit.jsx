// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import "../styles/RiskEdit.css";

// const RiskEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [form, setForm] = useState({
//     title: "",
//     category: "",
//     probability: 1,
//     impact: 1,
//     status: "open",
//     estimated_cost: "",
//     description: "",
//   });

//   const [loading, setLoading] = useState(true);

//   const getToken = () =>
//     localStorage.getItem("access") || sessionStorage.getItem("access");

//   /* ===== CALCULATION ===== */
//   const riskScore = form.probability * form.impact;

//   const getRiskMeta = (score) => {
//     if (score <= 6) return { level: "Low", percent: 10, cls: "low" };
//     if (score <= 14) return { level: "Medium", percent: 30, cls: "medium" };
//     return { level: "High", percent: 60, cls: "high" };
//   };

//   const meta = getRiskMeta(riskScore);
//   const lossAmount =
//     (Number(form.estimated_cost || 0) * meta.percent) / 100;

//   useEffect(() => {
//     if (location.state?.risk) {
//       hydrateForm(location.state.risk);
//     } else {
//       fetchRisk();
//     }
//     // eslint-disable-next-line
//   }, []);

//   const hydrateForm = (risk) => {
//     setForm({
//       title: risk.title,
//       category: risk.category,
//       probability: risk.probability,
//       impact: risk.impact,
//       status: risk.status,
//       estimated_cost: risk.estimated_cost,
//       description: risk.description || "",
//     });
//     setLoading(false);
//   };

//   const fetchRisk = async () => {
//     try {
//       const token = getToken();
//       const res = await axios.get(
//         `http://127.0.0.1:8000/api/risks/${id}/`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       hydrateForm(res.data);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = getToken();
//       await axios.patch(
//         `http://127.0.0.1:8000/api/risks/${id}/`,
//         {
//           ...form,
//           probability: Number(form.probability),
//           impact: Number(form.impact),
//           estimated_cost: Number(form.estimated_cost),
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       navigate(`/risks/${id}`);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <div className="re-loading">Loading…</div>;

//   return (
//     <div className="re-page">
//       <button className="re-back" onClick={() => navigate(-1)}>
//         ← Back
//       </button>

//       <form className={`re-card ${meta.cls}`} onSubmit={handleSubmit}>
//         <h2>Edit Risk</h2>

//         {/* ===== FORM GRID ===== */}
//         <div className="re-grid">
//           <div>
//             <label>Title</label>
//             <input
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <label>Category</label>
//             <input
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <label>Probability (1–5)</label>
//             <input
//               type="number"
//               min="1"
//               max="5"
//               name="probability"
//               value={form.probability}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <label>Impact (1–5)</label>
//             <input
//               type="number"
//               min="1"
//               max="5"
//               name="impact"
//               value={form.impact}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <label>Status</label>
//             <select
//               name="status"
//               value={form.status}
//               onChange={handleChange}
//             >
//               <option value="open">Open</option>
//               <option value="mitigated">Mitigated</option>
//               <option value="closed">Closed</option>
//             </select>
//           </div>

//           <div>
//             <label>Estimated Cost (₹)</label>
//             <input
//               type="number"
//               name="estimated_cost"
//               value={form.estimated_cost}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>

//         {/* ===== AUTO CALC ===== */}
//         <div className="re-calc">
//           <div>
//             <label>Risk Score</label>
//             <p>{riskScore}</p>
//           </div>
//           <div>
//             <label>Risk Level</label>
//             <p>{meta.level}</p>
//           </div>
//           <div>
//             <label>Loss %</label>
//             <p>{meta.percent}%</p>
//           </div>
//           <div>
//             <label>Loss Amount</label>
//             <p className="re-loss">
//               ₹{lossAmount.toLocaleString()}
//             </p>
//           </div>
//         </div>

//         {/* ===== DESCRIPTION ===== */}
//         <div className="re-desc">
//           <label>Description</label>
//           <textarea
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//           />
//         </div>

//         {/* ===== ACTIONS ===== */}
//         <div className="re-actions">
//           <button type="submit" className="btn btn-primary">
//             💾 Save Changes
//           </button>
//           <button
//             type="button"
//             className="btn btn-outline"
//             onClick={() => navigate(`/risks/${id}`)}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default RiskEdit;
