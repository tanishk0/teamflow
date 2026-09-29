import Workspace from "../db/Workspace.js";
import WorkspaceMember from "../db/WorkspaceMember.js";
import Invitation from "../db/Invitation.js";
import Project from "../db/Project.js";
import Task from "../db/Task.js";
import ActivityLog from "../db/ActivityLog.js";
import { logActivity } from "../utils/activityLogger.js";

export async function createWorkspace(req, res) {
  const { name } = req.body;
  const trimmed = name?.trim();

  try {
    if (!trimmed) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    if (trimmed.length > 120) {
      return res.status(400).json({
        message: "Workspace name cannot exceed 120 characters",
      });
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Workspace.findOne({
      name: { $regex: new RegExp(`^${escaped}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        message: "A workspace with this name already exists",
      });
    }

    const workspace = await Workspace.create({
      name: trimmed,
      owner: req.userId,
    });
    //creating the owner the first member
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.userId,
      role: "owner",
      status: "active",
    });

    await logActivity({
      workspaceId: workspace._id,
      actorId: req.userId,
      action: "workspace_created",
      entityType: "workspace",
      entityId: workspace._id,
      entityName: workspace.name,
      description: `Created workspace "${workspace.name}"`,
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create workspace",
      error: error.message,
    });
  }
}

export async function getWorkspaces(req, res) {
  try {
    const members = await WorkspaceMember.find({
      userId: req.userId,
      status: "active",
    }).populate("workspaceId");

    const validWorkspaces = members
      .map((member) => member.workspaceId)
      .filter(Boolean);

    const workspaceIds = validWorkspaces.map((w) => w._id);

    const projectCounts = await Project.aggregate([
      { $match: { workspaceId: { $in: workspaceIds } } },
      { $group: { _id: "$workspaceId", count: { $sum: 1 } } },
    ]);

    const countMap = projectCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const workspaces = validWorkspaces.map((w) => {
      const obj = w.toObject ? w.toObject() : { ...w };
      obj.projectsCount = countMap[obj._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch workspaces",
      error: error.message,
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

export async function renameWorkspace(req, res) {
  const { name } = req.body;
  const trimmed = name?.trim();

  try {
    if (!trimmed) {
      return res.status(400).json({
        message: "Workspace name cannot be empty",
      });
    }

    if (trimmed.length > 120) {
      return res.status(400).json({
        message: "Workspace name cannot exceed 120 characters",
      });
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Workspace.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${escaped}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        message: "A workspace with this name already exists",
      });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { name: trimmed },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    await logActivity({
      workspaceId: workspace._id,
      actorId: req.userId,
      action: "workspace_renamed",
      entityType: "workspace",
      entityId: workspace._id,
      entityName: trimmed,
      description: `Renamed workspace to "${trimmed}"`,
      details: { newName: trimmed },
    });

    res.status(200).json({
      message: "Workspace renamed successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to rename workspace",
      error: error.message,
    });
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // 1. Find all projects in this workspace
    const projects = await Project.find({ workspaceId: id }).select("_id");
    const projectIds = projects.map((p) => p._id);

    // 2. Cascade delete all tasks belonging to projects of this workspace
    if (projectIds.length > 0) {
      await Task.deleteMany({
        projectId: { $in: projectIds },
      });
    }

    // 3. Cascade delete all projects in this workspace
    await Project.deleteMany({
      workspaceId: id,
    });

    // 4. Cascade delete members, invitations, and activity logs
    await WorkspaceMember.deleteMany({
      workspaceId: id,
    });

    await Invitation.deleteMany({
      workspaceId: id,
    });

    await ActivityLog.deleteMany({
      workspaceId: id,
    });

    // 5. Delete the workspace document
    await Workspace.findByIdAndDelete(id);

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

export async function removeWorkspaceMember(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner = workspace.owner.toString() === req.userId.toString();
    if (!isOwner) {
      const callerMembership = await WorkspaceMember.findOne({
        workspaceId: id,
        userId: req.userId,
        role: "manager",
        status: "active",
      });
      if (!callerMembership) {
        return res.status(403).json({
          message: "Only workspace owners or managers can remove members",
        });
      }
    }

    // Cannot remove the owner of the workspace
    if (workspace.owner.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Cannot remove the workspace owner",
      });
    }

    const removed = await WorkspaceMember.findOneAndDelete({
      workspaceId: id,
      userId,
    });

    if (!removed) {
      return res.status(404).json({
        message: "Member not found in this workspace",
      });
    }

    await logActivity({
      workspaceId: id,
      actorId: req.userId,
      action: "member_removed",
      entityType: "member",
      entityId: userId,
      description: `Removed a member from the workspace`,
      details: { removedUserId: userId },
    });

    return res.status(200).json({
      message: "Member removed from workspace successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove member",
      error: error.message,
    });
  }
}

export async function updateWorkspaceMemberRole(req, res) {
  const { id } = req.params;
  const { userId, role } = req.body;

  try {
    if (!["manager", "member"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either manager or member",
      });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const ownerIdStr = workspace.owner?._id
      ? workspace.owner._id.toString()
      : workspace.owner?.toString();

    const isOwner = ownerIdStr === req.userId.toString();
    if (!isOwner) {
      const callerMembership = await WorkspaceMember.findOne({
        workspaceId: id,
        userId: req.userId,
        role: "manager",
        status: "active",
      });
      if (!callerMembership) {
        return res.status(403).json({
          message: "Only workspace owners or managers can change member roles",
        });
      }
    }

    // Cannot change the workspace owner's role
    if (ownerIdStr === userId.toString()) {
      return res.status(400).json({
        message: "Cannot change the workspace owner's role",
      });
    }

    // User cannot change their own role
    if (req.userId.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const updatedMember = await WorkspaceMember.findOneAndUpdate(
      {
        workspaceId: id,
        userId,
      },
      { role },
      { new: true }
    ).populate("userId", "name email");

    if (!updatedMember) {
      return res.status(404).json({
        message: "Member not found in this workspace",
      });
    }

    const memberName =
      updatedMember.userId?.name || updatedMember.userId?.email || "Member";
    await logActivity({
      workspaceId: id,
      actorId: req.userId,
      action: "member_role_updated",
      entityType: "member",
      entityId: userId,
      entityName: memberName,
      description: `Updated role for ${memberName} to ${role}`,
      details: { targetUserId: userId, newRole: role },
    });

    return res.status(200).json({
      message: "Member role updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update member role",
      error: error.message,
    });
  }
}