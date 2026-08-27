import Workspace from "../db/Workspace.js";
import WorkspaceMember from "../db/WorkspaceMember.js";

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

        res.status(200).json({
            workspaces: members
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch workspaces"
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

export async function deleteWorkspace(req,res){
    try{
        const workspace = await Workspace.findByIdAndDelete(req.params.id)
        
        
        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found"
            })
        }
        await WorkspaceMember.deleteMany({
            workspaceId: req.params.id
        });
        res.status(200).json({
            message: "Workspace deleted successfully"
        }
    )
    }
    catch(error){
        res.status(500).json({
            message: "Failed to delete workspace",
            error: error.message
        })
    }
}