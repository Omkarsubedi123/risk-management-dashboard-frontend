import React from "react";

const AdminStatCard = ({ title, value, subtitle }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-top">
        <span className="admin-stat-title">{title}</span>
      </div>
      <div className="admin-stat-value">{value}</div>
      {subtitle ? <div className="admin-stat-subtitle">{subtitle}</div> : null}
    </div>
  );
};

export default AdminStatCard;