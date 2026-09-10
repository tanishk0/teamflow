import User from "../db/User.js";
import Team from "../db/Team.js";

export async function createTeam(req, res) {
  const { name } = req.body;

  try {
    if (!name?.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const team = await Team.create({
      name: name.trim(),
      ownerId: req.userId,
      members: [req.userId],
    });

    return res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create team",
      error: error.message,
    });
  }
}








