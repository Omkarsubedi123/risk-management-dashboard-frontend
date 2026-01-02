import "./../styles/ProjectTeam.css";

const TeamMembersCard = ({ member }) => {
  return (
    <div className="team-member-card">
      <div>
        <h4>{member.full_name}</h4>
        <p>{member.email}</p>
      </div>

      <span className={`role-badge ${member.role}`}>
        {member.role}
      </span>
    </div>
  );
};

export default TeamMembersCard;
