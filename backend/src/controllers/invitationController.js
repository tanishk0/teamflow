import Workspace from "../db/Workspace.js";

import WorkspaceMember from "../db/WorkspaceMember.js";
import User from "../db/User.js";
import Invitation from "../db/Invitation.js"

export async function getInvites(req, res) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const invitations = await Invitation.find({
            email: user.email,
            status: "pending",
        })
        .populate("workspaceId", "name")
        .populate("inviterId", "name email");

        return res.status(200).json({
            message: "Invitations fetched successfully",
            invitations,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch invites",
            error: error.message,
        });
    }
}

//
export async function getWorkspaceInvites(req, res) {
  const { workspaceId } = req.params;

  try {
    const invitations = await Invitation.find({ workspaceId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      invitations,
    });
  } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch workspace invitations",
            error: error.message,
        });
    } 
}

export async function createInvite(req, res) {
  const { email, role } = req.body;

  console.log("CREATE INVITE BODY:", req.body);

  if (!["manager", "member"].includes(role)) {
    console.log("INVALID ROLE:", role);
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const { workspaceId } = req.params;

  try {
    console.log("WORKSPACE ID:", workspaceId);

    const workspace = await Workspace.findById(workspaceId);

    console.log("WORKSPACE:", workspace?._id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    console.log("INVITED USER:", user?._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingMember = await WorkspaceMember.findOne({
      workspaceId,
      userId: user._id,
    });

    console.log("EXISTING MEMBER:", existingMember);

    if (existingMember) {
      return res.status(400).json({
        message: "User is already a member of this workspace",
      });
    }

    // Check for existing pending invitation
    const existingInvite = await Invitation.findOne({
      workspaceId,
      email: email.toLowerCase().trim(),
      status: "pending",
    });

    if (existingInvite) {
      return res.status(400).json({
        message: "An invitation is already pending for this user",
      });
    }

    console.log("CREATING INVITATION");

    const invitation = await Invitation.create({
      workspaceId,
      inviterId: req.userId,
      email: email.toLowerCase().trim(),
      role,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("INVITATION CREATED:", invitation._id);

    return res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error("CREATE INVITE ERROR:", error);

    return res.status(500).json({
      message: "Failed to send an invite",
      error: error.message,
    });
  }
}

export async function acceptInvite(req, res){
    const { id } = req.params;
    try{
        const invitation = await Invitation.findById(id);
        if(!invitation){
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        //find the invite belongs to the user
        const user = await User.findById(req.userId);
        if(invitation.email?.toLowerCase().trim() !== user.email?.toLowerCase().trim()){
            return res.status(403).json({
                message: "This invitation does not belong to you"
            })
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }
        invitation.status = "accepted";
        await invitation.save();
        
        await WorkspaceMember.create({
            workspaceId: invitation.workspaceId,
            userId: req.userId,
            role: invitation.role,
            status: "active",
        });
        res.status(200).json({
            message: "Invite accepted"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to accept the invite",
            error: error.message,
        })
    }
}

export async function rejectInvite(req ,res){
    const {id} = req.params;
    try{
        const invitation = await Invitation.findById(id);
        if(!invitation){
            return res.status(404).json({
                message: "Invite does not exist"
            })
        }

        //find the invite belongs to the user
        const user = await User.findById(req.userId);
        if(invitation.email?.toLowerCase().trim() !== user.email?.toLowerCase().trim()){
            return res.status(403).json({
                message: "This invitation does not belong to you"
            })
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }

        //update invitation and member models
        invitation.status = "rejected";
        await invitation.save();

        res.status(200).json({
            message: "Invite rejected successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to reject invitation",
            error: error.message,
        })
    }
}

