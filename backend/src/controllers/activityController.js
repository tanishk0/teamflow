import mongoose from "mongoose";
import ActivityLog from "../db/ActivityLog.js";
import Workspace from "../db/Workspace.js";
import WorkspaceMember from "../db/WorkspaceMember.js";

/**
 * Fetch activity logs for a given workspace with pagination and optional filtering
 */
export async function getActivityLogs(req, res) {
  const workspaceId = req.params.workspaceId || req.params.id;
  const {
    page = 1,
    limit = 20,
    entityType,
    action,
    startDate,
    endDate,
  } = req.query;

  try {
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        message: "A valid workspace ID is required",
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Authorization: User must be workspace owner or an active member
    const isOwner = workspace.owner?._id
      ? workspace.owner._id.toString() === req.userId.toString()
      : workspace.owner?.toString() === req.userId.toString();

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.userId,
      status: "active",
    });

    if (!isOwner && !membership) {
      return res.status(403).json({
        message: "You do not have access to this workspace's activity log",
      });
    }

    // Build query filter
    const query = { workspaceId };

    if (entityType) {
      query.entityType = entityType;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("actorId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ActivityLog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      message: "Activity logs fetched successfully",
      activities,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch activity logs",
      error: error.message,
    });
  }
}

/**
 * Fetch summary stats of activities for a workspace
 */
export async function getActivityStats(req, res) {
  const workspaceId = req.params.workspaceId || req.params.id;

  try {
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        message: "A valid workspace ID is required",
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner = workspace.owner?._id
      ? workspace.owner._id.toString() === req.userId.toString()
      : workspace.owner?.toString() === req.userId.toString();

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.userId,
      status: "active",
    });

    if (!isOwner && !membership) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const totalActivities = await ActivityLog.countDocuments({ workspaceId });
    const countsByType = await ActivityLog.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
      { $group: { _id: "$entityType", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      totalActivities,
      countsByType: countsByType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch activity stats",
      error: error.message,
    });
  }
}

/**
 * Fetch recent activities across all workspaces the user has access to
 */
export async function getUserActivityFeed(req, res) {
  try {
    const memberships = await WorkspaceMember.find({
      userId: req.userId,
      status: "active",
    }).select("workspaceId");

    const ownedWorkspaces = await Workspace.find({
      owner: req.userId,
    }).select("_id");

    const workspaceIds = Array.from(
      new Set([
        ...memberships.map((m) => m.workspaceId?.toString()).filter(Boolean),
        ...ownedWorkspaces.map((w) => w._id?.toString()).filter(Boolean),
      ])
    ).map((id) => new mongoose.Types.ObjectId(id));

    if (workspaceIds.length === 0) {
      return res.status(200).json({
        message: "User activity feed fetched successfully",
        activities: [],
      });
    }

    const activities = await ActivityLog.find({
      workspaceId: { $in: workspaceIds },
    })
      .populate("actorId", "name email")
      .populate("workspaceId", "name")
      .sort({ createdAt: -1 })
      .limit(15);

    const validActivities = activities.filter(
      (act) => act.workspaceId && act.actorId
    );

    return res.status(200).json({
      message: "User activity feed fetched successfully",
      activities: validActivities,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch activity feed",
      error: error.message,
    });
  }
}
