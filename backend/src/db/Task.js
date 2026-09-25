import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo",
    },

    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
    },

    dueDate: {
        type: Date,
        default: null
    },

    section: {
        type: String,
        trim: true,
    },
}, {timestamps: true}
)

export default mongoose.model("Task", TaskSchema);