import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeamPreviewCard = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    if (!projectId) return;

    const token = getToken();
    if (!token) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`http://127.0.0.1:8000/api/projects/${projectId}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // supports array or {results: []}
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setMembers(data);
      })
      .catch((err) => {
        console.error("Failed to load members", err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const rows = useMemo(() => {
    return (members || []).map((m) => {
      const name =
        m.full_name ||
        m.fullName ||
        m.username ||
        m.name ||
        m.email ||
        "—";

      // ✅ role may be missing or under another key depending on serializer
      const roleRaw = m.role || m.user_role || m.member_role || m.team_role || m.user?.role;
      const role = (roleRaw || "Member").toString().trim();

      const roleKey = role.toLowerCase(); // safe

      return {
        id: m.id || `${name}-${role}`,
        name,
        role,
        roleKey,
      };
    });
  }, [members]);

  return (
    <div className="pd-card">
      <div className="pd-top">
        <div>
          <h3 style={{ margin: 0 }}>Team Members</h3>
          <p className="pd-muted" style={{ margin: "6px 0 0" }}>
            Organized list of team members with roles.
          </p>
        </div>

        <button
          className="pdX-btn pdX-btn-outline"
          type="button"
          onClick={() => navigate(`/projects/${projectId}/team`)}
        >
          Manage Team →
        </button>
      </div>

      {loading ? (
        <p className="pd-muted" style={{ marginTop: 10 }}>
          Loading team…
        </p>
      ) : rows.length === 0 ? (
        <p className="pd-muted" style={{ marginTop: 10 }}>
          No team members added yet.
        </p>
      ) : (
        <div className="pdX-table-wrap" style={{ marginTop: 12 }}>
          <table className="pdX-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: "right" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 950 }}>{r.name}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`pdX-badge ${
                        r.roleKey === "pm" ? "pdX-badge-low" : "pdX-badge-medium"
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamPreviewCard;