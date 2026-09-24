import Workspace from "../db/Workspace.js";
import WorkspaceMember from "../db/WorkspaceMember.js";
import Invitation from "../db/Invitation.js";

export async function createWorkspace(req , res){
    const { name } = req.body;
    try {
        const workspace = await Workspace.create({
            name: name,
            owner: req.userId
        })
        //creating the owner the first member
        await WorkspaceMember.create({
            workspaceId: workspace._id,
            userId: req.userId,
            role: "owner",
            status: "active"
        })
        res.status(201).json({
            message: "Workspace created successfully",
            workspace
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message: "Failed to create workspace",
            error: error.message
        })
    }
}

export async function getWorkspaces(req , res){
    try{
        const members = await WorkspaceMember
            .find({
                userId: req.userId,
                status: "active"
            })
            .populate("workspaceId");
        const workspaces = members
            .map((member) => member.workspaceId)
            .filter(Boolean);

        res.status(200).json({
            workspaces
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch workspaces"
        });
    }
}

export async function getWorkspace(req, res) {
    try {
        const { id } = req.params;
        const workspace = await Workspace.findById(id).populate("owner", "name email");
        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const membership = await WorkspaceMember.findOne({
            workspaceId: id,
            userId: req.userId,
            status: "active",
        });

        const isWorkspaceOwner = workspace.owner?._id
            ? workspace.owner._id.toString() === req.userId.toString()
            : workspace.owner?.toString() === req.userId.toString();

        if (!membership && !isWorkspaceOwner) {
            return res.status(403).json({
                message: "You do not have access to this workspace",
            });
        }

        const membersCount = await WorkspaceMember.countDocuments({
            workspaceId: id,
            status: "active",
        });

        return res.status(200).json({
            workspace: {
                ...workspace.toObject(),
                membersCount,
                isOwner: isWorkspaceOwner,
                role: isWorkspaceOwner ? "owner" : (membership?.role || "member"),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch workspace",
            error: error.message,
        });
    }
}

export async function renameWorkspace(req , res){
    const {name} = req.body;
    try{
        const workspace = await Workspace.findByIdAndUpdate(
            req.params.id,
            {name},
            {new:true}
        )

        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found"
            })
        }
        res.status(200).json({
            message:"Workspace renamed successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to rename workspace",
            error: error.message
        })
    }
}

export async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findByIdAndDelete(id);


    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    await WorkspaceMember.deleteMany({
      workspaceId: id,
    });

    await Invitation.deleteMany({
      workspaceId: id,
    });


    return res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete workspace",
      error: error.message,
    });
  }
}

export async function getWorkspaceMembers(req, res) {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId: id,
      userId: req.userId,
      status: "active",
    });

    const isOwner = workspace.owner?._id
      ? workspace.owner._id.toString() === req.userId.toString()
      : workspace.owner?.toString() === req.userId.toString();

    if (!membership && !isOwner) {
      return res.status(403).json({
        message: "You do not have access to this workspace",
      });
    }

    const members = await WorkspaceMember.find({
      workspaceId: id,
      status: "active",
    })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      members,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch workspace members",
      error: error.message,
    });
  }
}