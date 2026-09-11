import TeamInvitation from "../db/TeamInvitation.js"
import Team from "../db/Team.js"
import User from "../db/User.js";
import Invitation from "../db/Invitation.js";

export async function createTeamInvite(req, res){
    const {email} = req.body;
    const {teamId} = req.params;

    try{
        const team = await Team.findById(teamId);
        if(!team){
            return res.status(404).json({
                message: "Team not found"
            })
        }
        // Find the user to invite
        const user = await User.findOne({email: email.toLowerCase().trim()})
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        //Check for existing user
        const existingMember = team.members.includes(user._id);

        if(existingMember){
            return res.status(400).json({
                message: "User is already a member"
            })
        }

        //Create team invite
        const teamInvitation = await TeamInvitation.create({
            teamId,
            inviterId: req.userId,
            email,
            status: "pending"
        })
        res.status(201).json({
            message: "Invitation sent successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to invite a user",
            error: error.message
        })
    }
}

export async function acceptTeamInvite(req, res){
    //get invite id
    const { id } = req.params;
    try{

        const teamInvitation = await TeamInvitation.findById(id);
        if(!teamInvitation){
            return res.status(404).json({
                message: "Invite to the team not found"
            })
        }
        //find user to whom the invite belongs to
        const user = await User.findById(req.userId);
        if(teamInvitation.email !== user.email){
            return res.status(403).json({
                message: "This invite doesn't belong to you"
            })
        }

        //check for pending
        if(teamInvitation.status !== "pending"){
            return res.status(400).json({
                message: "Invite to the team is no longer pending"
            })
        }
        //change status to accepted
        teamInvitation.status = "accepted"
        await teamInvitation.save();

        // add member to team
        await Team.updateOne(
            { _id: teamInvitation.teamId },
            { $addToSet: { members: req.userId } }
        );
        return res.status(200).json({
            message: "Team invitation accepted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to add member"
        })
    }
}

export async function rejectTeamInvite(req, res){
    //get invite id
    const { id } = req.params;
    try{

        const teamInvitation = await TeamInvitation.findById(id);
        if(!teamInvitation){
            return res.status(404).json({
                message: "Invite to the team not found"
            })
        }
        //find user to whom the invite belongs to
        const user = await User.findById(req.userId);
        if(teamInvitation.email !== user.email){
            return res.status(403).json({
                message: "This invite doesn't belong to you"
            })
        }

        //check for pending
        if(teamInvitation.status !== "pending"){
            return res.status(400).json({
                message: "Invite to the team is no longer pending"
            })
        }
        //change status to rejected
        teamInvitation.status = "rejected"
        await teamInvitation.save();

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

export async function getTeamInvites(req, res){
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const teamInvitations = await TeamInvitation.find({
            email: user.email,
            status: "pending",
        })
        .populate("teamId", "name")
        .populate("inviterId", "name email");

        return res.status(200).json({
            message: "Invitations fetched successfully",
            teamInvitations,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch team invites",
            error: error.message,
        });
    }
}