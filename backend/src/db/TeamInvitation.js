import mongoose from "mongoose";

const TeamInvitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

  },
  { timestamps: true }
);

const TeamInvitation = mongoose.model(
  "TeamInvitation",
  TeamInvitationSchema
);

export default TeamInvitation;