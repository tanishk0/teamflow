import mongoose from "mongoose";

const InvitationModel = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },

        inviterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["manager", "member"],
            required: true
        },

        token: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "expired"],
            default: "pending"
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

const Invitation = mongoose.model("Invitation", InvitationModel);

export default Invitation;