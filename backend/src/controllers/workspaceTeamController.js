import Workspace from "../db/Workspace.js";
import Team from "../db/Team.js";
import WorkspaceMember from "../db/WorkspaceMember.js";

export async function addTeamsToWorkspace(req, res) {
  const { workspaceId } = req.params;
  const { teamIds } = req.body;

  console.log("ADD TEAM REQUEST:", {
    workspaceId,
    teamIds,
    userId: req.userId,
  });

  try {
    if (!Array.isArray(teamIds)) {
      return res.status(400).json({
        message: "teamIds must be an array",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    console.log("WORKSPACE FOUND:", workspace?._id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner = workspace.owner.toString() === req.userId.toString();
    if (!isOwner) {
      const membership = await WorkspaceMember.findOne({
        workspaceId,
        userId: req.userId,
        role: { $in: ["owner", "manager"] },
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({
          message: "You do not have permission to add teams to this workspace",
        });
      }
    }

    const teams = await Team.find({
      _id: { $in: teamIds },
      $or: [
        { ownerId: req.userId },
        { members: req.userId },
      ],
    });

    console.log(
      "TEAMS FOUND:",
      teams.map((team) => ({
        id: team._id,
        name: team.name,
        members: team.members,
      }))
    );

    const memberUserIds = new Set();
    for (const team of teams) {
      if (team.ownerId) {
        memberUserIds.add(team.ownerId.toString());
      }
      if (Array.isArray(team.members)) {
        for (const member of team.members) {
          if (member) {
            memberUserIds.add(member.toString());
          }
        }
      }
    }

    for (const userId of memberUserIds) {
      if (userId === req.userId.toString()) {
        continue;
      }

      const result = await WorkspaceMember.updateOne(
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

    return res.status(200).json({
      message: "Teams added to workspace successfully",
    });
  } catch (error) {
    console.error("ADD TEAMS ERROR:", error);
    return res.status(500).json({
      message: "Failed to add teams to workspace",
      error: error.message,
    });
  }
}