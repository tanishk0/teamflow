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

export async function getTeams(req, res){
    try{
        const teams = await Team.find({
            ownerId: req.userId,
        });

        return res.status(200).json({
            message: "Teams fetched successfully",
            teams,
        })
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to fetch teams",
            error: error.message,
        });
    }
}







