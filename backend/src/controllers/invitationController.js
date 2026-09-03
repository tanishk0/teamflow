import Workspace from "../db/Workspace.js";

import WorkspaceMember from "../db/WorkspaceMember.js";
import User from "../db/User.js";
import Invitation from "../db/Invitation.js"

export async function getInvites(req, res){
    try{
        const user = await User.findById(req.userId)
        const invitations = await Invitation.find({
            email: user.email,
            status: "pending",
        });

        res.status(200).json({
            message: "Invitations fetched successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch invites",
            error: error.message,
        })
    }
}

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

export async function createInvite(req, res){
    const { email, role } = req.body;
    if (!["manager", "member"].includes(role)) {
        return res.status(400).json({
        message: "Invalid role",
        });
    }
    const { workspaceId } = req.params;
    try{
        const workspace = await Workspace.findById(workspaceId);
        if(!workspace){
                return res.status(404).json({
                message: "Workspace not found"
            });
        }
        // 2. Find invited user
        const user = await User.findOne({email: email.toLowerCase().trim(),});

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        //check if already a member
        const existingMember = await WorkspaceMember.findOne({
            workspaceId,
            userId: user._id,
        })
        if(existingMember){
            return res.status(400).json({
                message: "User is already a member or invited"
            })
        }

        // Create invite
        const invitation = await Invitation.create({
            workspaceId,
            inviterId: req.userId,
            email,
            role,
            status: "pending",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

        //Create workspace member
        await WorkspaceMember.create({
            workspaceId,
            userId: user._id,
            role,
            status: "invited"
        })

        res.status(201).json({
            message: "Invitation sent successfully",
            invitation,
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to sent an invite",
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
        if(invitation.email !== user.email){
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
        
        await WorkspaceMember.updateOne(
            {
                workspaceId: invitation.workspaceId,
                userId: req.userId
            },
            {status : "active"}
        )
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
        if(invitation.email !== user.email){
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

        await WorkspaceMember.deleteOne(
            {
                workspaceId: invitation.workspaceId,
                userId: req.userId,
            }
        )
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