import ActivityLog from "../db/ActivityLog.js";

/**
 * Safely logs an activity to the database without throwing uncaught exceptions.
 *
 * @param {Object} options
 * @param {string|mongoose.Types.ObjectId} options.workspaceId
 * @param {string|mongoose.Types.ObjectId} options.actorId
 * @param {string} options.action
 * @param {"workspace"|"project"|"task"|"member"|"team"|"invitation"} options.entityType
 * @param {string|mongoose.Types.ObjectId} [options.entityId]
 * @param {string} [options.entityName]
 * @param {string} options.description
 * @param {Object} [options.details]
 */
export async function logActivity({
  workspaceId,
  actorId,
  action,
  entityType,
  entityId = null,
  entityName = "",
  description,
  details = {},
}) {
  try {
    if (!workspaceId || !actorId || !action || !description) {
      return null;
    }

    const log = await ActivityLog.create({
      workspaceId,
      actorId,
      action,
      entityType,
      entityId: entityId || null,
      entityName: entityName || "",
      description,
      details: details || {},
    });

    return log;
  } catch (error) {
    console.error("Failed to log activity:", error.message);
    return null;
  }
}

export default logActivity;
