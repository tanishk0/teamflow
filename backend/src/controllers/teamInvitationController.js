import TeamInvitation from "../db/TeamInvitation.js"
import Team from "../db/Team.js"
import User from "../db/User.js";

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