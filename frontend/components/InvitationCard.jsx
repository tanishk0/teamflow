export default function InvitationCard({ invite, type, onAccept, onReject }) {
  const isTeamInvite = type === "team";

  return (
    <div className="bg-white rounded-md p-5 w-full flex items-center justify-between">
      <div>
        <h3 className="text-xl font-medium">
          {isTeamInvite ? invite.teamId.name : invite.workspaceId.name}
        </h3>

        <p>{invite.inviterId.name} invited you</p>

        <p className="text-sm text-gray-500">{invite.inviterId.email}</p>

        {!isTeamInvite && <p className="text-sm">Role: {invite.role}</p>}
      </div>

      <div className="flex gap-3">
        <button className="text-danger cursor-pointer" onClick={() => onReject(invite._id)}>Reject</button>

        <button className="text-white bg-primary p-2 rounded-md cursor-pointer" onClick={() => onAccept(invite._id)}>Accept</button>
      </div>
    </div>
  );
}
