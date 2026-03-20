import React from "react";

const AdminRoleBadge = ({ role }) => {
  const normalized = role || "";
  let cls = "role-badge";

  if (normalized === "AD") cls += " role-admin";
  else if (normalized === "PM") cls += " role-pm";
  else cls += " role-tm";

  const label =
    normalized === "AD"
      ? "Admin"
      : normalized === "PM"
      ? "Project Manager"
      : "Team Member";

  return <span className={cls}>{label}</span>;
};

export default AdminRoleBadge;