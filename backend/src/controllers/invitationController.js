import Workspace from "../db/Workspace.js";

import WorkspaceMember from "../db/WorkspaceMember";
import User from "../db/User.js";
import Invitation from "../db/Invitation.js"

export async function createInvite(req, res){
    const { email } = req.body;
    const { id: workspaceId } = req.params;
    try{
        const workspace = await Workspace.findById(workspaceId);
        if(!workspace){
                return res.status(404).json({
                message: "Workspace not found"
            });
        }
        // 2. Find invited user
        const user = await User.findOne({email});

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
            status: "pending",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

        //Create workspace member
        await WorkspaceMember.create({
            workspaceId,
            userId: user._id,
            role: "member",
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

        await Invitation.updateOne(
            {id: _id},
            {status : "accepted"}
        )
        await WorkspaceMember.updateOne(
            {
                workspaceId: invitation.workspaceId,
                userId: req.userId
            },
            {status : "active"}
        )
    }
    catch(error){
        res.status(500).json({
            message: "Failed to accept the invite",
            error: error.message,
        })
    }
}