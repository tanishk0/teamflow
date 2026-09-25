import Project from "../db/Project.js"
import WorkspaceMember from "../db/WorkspaceMember.js";
import Task from "../db/Task.js";
export async function createProject(req, res){
    const {name, description} = req.body;
    const {workspaceId} = req.params;
    try{
        if(!name?.trim()){
            return res.status(400).json({
                message: "Project name is required"
            })
        }
        if(description.trim().length > 500){
            return res.status(400).json({
                message: "Description cannot be longer than 500 characters"
            })
        }
        if(name?.trim().length >= 120){
            return res.status(400).json({
                message: "Name cannot be longer than 120 characters"
            })
        }
        const member = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.userId,
            status: "active",
            
        });
        if (!member) {
            return res.status(403).json({ message: "Not a workspace member" });
        }
        if (!["owner", "manager"].includes(member.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const project = await Project.create(
            {
                workspaceId,
                name: name.trim(),
                description: description?.trim() || "",
                createdBy: req.userId,
            }
        )
        return res.status(201).json({
            message: "Project created successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to create a project",
            error: error.message
        })
    }
}


export async function getProjects(req, res){
    try{
        const {workspaceId} = req.params
        const projects = Project.find({
            workspaceId,
        })
        return res.status(200).json({
            projects,
            message: "Projects fetched successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch projects.",
            error: error.message
        });
    }
}

export async function getProject(req, res){
    const { id } = req.params;
    try{
        const project = await Project.findById(id);
        if(!project){
            return res.status(404).json({
                message: "Project not found"
            })
        }

        const member = await WorkspaceMember.findOne({
            workspaceId: project.workspaceId,
            userId: req.userId,
            status: "active",
        });

        if (!member) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        return res.status(200).json({
            message: "Project fetched successfully"
        })

    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch project",
            error: error.message
        })
    }
}



