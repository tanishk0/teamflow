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

export async function renameProject(req, res){
    const {name} = req.body;
    const trimmed = name?.trim()
    
    try{
        if(!trimmed){
            return res.status(400).json({
                message: "Rename should have a valid name."
            })
        }
        if(trimmed.length > 120){
            return res.status(400).json({
                message: "Rename should have a valid name less than 120 chars."
            })
        }
        const project = await Project.findById(req.params.id);

        const member = await WorkspaceMember.findOne({
            workspaceId: project.workspaceId,
            userId: req.userId,
            status: "active",
        });

        if (!member || !["owner", "manager"].includes(member.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {name: trimmed},
            { new: true }
        )

        if(!project){
            return res.status(404).json({
                message: "Project not found"
            })
        }

        res.status(200).json({
            message: "Project renamed successfully",
            project,
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to rename project.",
            error: error.message
        })
    }
}

export async function deleteProject(req,res){
    try{
        const project = await Project.findById(req.params)
        if(!project){
            return res.status(404).json({
                message: "Project not found."
            })
        }
        const member = await WorkspaceMember.findOne({
            workspaceId: project.workspaceId,
            userId: req.userId,
            status: "active",
        });

        if (!member || !["owner", "manager"].includes(member.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Project.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: "Project deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to delete project",
        });
    }
}


