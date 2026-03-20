import React from "react";

const AdminStatusBadge = ({ active }) => {
  return (
    <span className={active ? "status-badge active" : "status-badge inactive"}>
      {active ? "Active" : "Inactive"}
    </span>
  );
};

export default AdminStatusBadge;