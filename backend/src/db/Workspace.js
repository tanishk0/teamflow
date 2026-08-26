import mongoose from "mongoose";

const WorkspaceModel = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
        
}, {timestamps: true})

const Workspace = mongoose.model("Workspace", WorkspaceModel);

export default Workspace;                    