import mongoose from "mongoose";

const WorkspaceMemberModel = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    role:{
        type: String,
        enum: ["owner", "manager", "member"],
        required: true
    },
    status: {
        type: String,
        enum: ["invited" , "active"],
        required: true
    }
}, {timestamps: true})

const WorkspaceMember = mongoose.model(
    "WorkspaceMember",
    WorkspaceMemberModel
);

export default WorkspaceMember;