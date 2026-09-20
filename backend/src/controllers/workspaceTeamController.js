import Workspace from "../db/Workspace.js";
import Team from "../db/Team.js";
import WorkspaceMember from "../db/WorkspaceMember.js";

export async function addTeamsToWorkspace(req, res) {
  const { workspaceId } = req.params;
  const { teamIds } = req.body;

  try {
    if (!Array.isArray(teamIds)) {
      return res.status(400).json({
        message: "teamIds must be an array",
      });
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      ownerId: req.userId,
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const teams = await Team.find({
      
      _id: { $in: teamIds },
      $or: [
        { ownerId: req.userId },
        { members: req.userId },
      ],
    });
    console.log("TEAM IDS FROM FRONTEND:", teamIds);

console.log(
  "TEAMS FOUND:",
  teams.map((team) => ({
    id: team._id,
    name: team.name,
    members: team.members,
  }))
);
    for (const team of teams) {
      for (const userId of team.members) {
        await WorkspaceMember.updateOne(
          {
            workspaceId,
            userId,
          },
          {
            $setOnInsert: {
              workspaceId,
              userId,
              role: "member",
              status: "active",
            },
          },
          { upsert: true }
        );
        console.log("WORKSPACE MEMBER RESULT:", {
  userId,
  matched: result.matchedCount,
  modified: result.modifiedCount,
  upserted: result.upsertedId,
});
      }
    }
    

    return res.status(200).json({
      message: "Teams added to workspace successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add teams to workspace",
      error: error.message,
    });
  }
}