export default function TeamCard({ team, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5
                 cursor-pointer hover:border-gray-300 hover:shadow-sm
                 transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>

          <p className="text-sm text-gray-500 mt-1">
            {team.members.length}{" "}
            {team.members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </div>
    </div>
  );
}
