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
          $or: [
            { ownerId: req.userId },
            { members: req.userId }
          ]
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

export async function renameTeam(req, res){
    const {name} = req.body;
    try{
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Team name cannot be empty"
            });
        }
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true }
        );
        if(!team){
            return res.status(404).json({
                message: "Team not found"
            });
        }
        res.status(200).json({
            message:"Team renamed successfully",
            team
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to rename team",
            error: error.message
        });
    }
}

export async function deleteTeam(req, res){
    const {id} = req.params;
    try{
        const team = await Team.findByIdAndDelete(id);
        if(!team){
            return res.status(404).json({
                message: "Team not found",
            });
        }
        return res.status(200).json({
            message: "Team deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to delete a team",
            error: error.message
        });
    }
}

export async function removeMember(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    team.members = team.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    await team.save();

    return res.status(200).json({
      message: "Member removed successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove member",
      error: error.message,
    });
  }
}

export async function getTeam(req, res) {
  const { id } = req.params;

  try {
    const team = await Team.findOne({
      _id: id,
      $or: [
        { ownerId: req.userId },
        { members: req.userId },
      ],
    }).populate("members", "name email");

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    return res.status(200).json({
      message: "Team fetched successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch team",
      error: error.message,
    });
  }
}







