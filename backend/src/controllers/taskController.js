import mongoose from "mongoose";
import Task from "../db/Task.js";
import Project from "../db/Project.js";
import WorkspaceMember from "../db/WorkspaceMember.js";
import Workspace from "../db/Workspace.js";

async function checkWorkspaceManagerOrOwner(workspaceId, userId) {
  const member = await WorkspaceMember.findOne({
    workspaceId,
    userId,
    status: "active",
  });
  const workspace = await Workspace.findById(workspaceId);
  const isOwner =
    workspace?.owner?.toString() === userId.toString() ||
    member?.role === "owner";
  const isManager = member?.role === "manager";

  return {
    isAllowed: Boolean(isOwner || isManager),
    isOwner: Boolean(isOwner),
    isManager: Boolean(isManager),
    member,
    workspace,
  };
}

export async function createTask(req, res) {
  const projectId = req.params.projectId || req.body.projectId;
  const { title, status, assigneeId, priority, dueDate, section } = req.body;

  try {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "A valid project ID is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        message: "Title cannot be longer than 200 characters",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const { isAllowed } = await checkWorkspaceManagerOrOwner(
      project.workspaceId,
      req.userId
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: "Only workspace owners and managers can create tasks",
      });
    }

    if (status && !["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values: todo, in_progress, done",
      });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority. Allowed values: low, medium, high",
      });
    }

    const targetAssigneeId = assigneeId || req.userId;
    if (!mongoose.Types.ObjectId.isValid(targetAssigneeId)) {
      return res.status(400).json({
        message: "A valid assignee ID is required",
      });
    }

    const task = await Task.create({
      projectId,
      title: title.trim(),
      status: status || "todo",
      assigneeId: targetAssigneeId,
      priority: priority || "low",
      dueDate: dueDate ? new Date(dueDate) : null,
      section: section?.trim() || "",
    });

    await task.populate("assigneeId", "name email");

    // Touch project updatedAt for latest activity
    await Project.findByIdAndUpdate(projectId, { updatedAt: new Date() });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
}

export async function getTasks(req, res) {
  const projectId = req.params.projectId || req.query.projectId;

  try {
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "A valid project ID is required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const member = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId: req.userId,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        message: "Not authorized to view tasks in this project",
      });
    }

    const filter = { projectId };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (
      req.query.assigneeId &&
      mongoose.Types.ObjectId.isValid(req.query.assigneeId)
    ) {
      filter.assigneeId = req.query.assigneeId;
    }
    if (req.query.section) {
      filter.section = req.query.section;
    }

    const tasks = await Task.find(filter)
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
}

export async function getTask(req, res) {
  const taskId = req.params.taskId || req.params.id;

  try {
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "A valid task ID is required",
      });
    }

    const task = await Task.findById(taskId).populate(
      "assigneeId",
      "name email"
    );
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project associated with this task not found",
      });
    }

    const member = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId: req.userId,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        message: "Not authorized to view this task",
      });
    }

    return res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
}

export async function updateTask(req, res) {
  const taskId = req.params.taskId || req.params.id;
  const { title, status, assigneeId, priority, dueDate, section } = req.body;

  try {
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "A valid task ID is required",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const member = await WorkspaceMember.findOne({
      workspaceId: project.workspaceId,
      userId: req.userId,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({
          message: "Title cannot be longer than 200 characters",
        });
      }
      updates.title = title.trim();
    }

    if (status !== undefined) {
      if (!["todo", "in_progress", "done"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed values: todo, in_progress, done",
        });
      }
      updates.status = status;
    }

    if (assigneeId !== undefined) {
      const currentAssigneeStr = task.assigneeId
        ? task.assigneeId.toString()
        : null;
      const targetAssigneeStr = assigneeId ? assigneeId.toString() : null;

      if (currentAssigneeStr !== targetAssigneeStr) {
        const { isAllowed } = await checkWorkspaceManagerOrOwner(
          project.workspaceId,
          req.userId
        );

        if (!isAllowed) {
          return res.status(403).json({
            message:
              "Only workspace owners and managers can assign or reassign tasks",
          });
        }
      }

      if (assigneeId && !mongoose.Types.ObjectId.isValid(assigneeId)) {
        return res.status(400).json({
          message: "A valid assignee ID is required",
        });
      }
      updates.assigneeId = assigneeId || null;
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({
          message: "Invalid priority. Allowed values: low, medium, high",
        });
      }
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (section !== undefined) {
      updates.section = section?.trim() || "";
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    }).populate("assigneeId", "name email");

    // Touch project updatedAt for latest activity
    await Project.findByIdAndUpdate(task.projectId, { updatedAt: new Date() });

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
}

export async function deleteTask(req, res) {
  const taskId = req.params.taskId || req.params.id;

  try {
    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "A valid task ID is required",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const { isAllowed } = await checkWorkspaceManagerOrOwner(
      project.workspaceId,
      req.userId
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: "Only workspace owners and managers can delete tasks",
      });
    }

    await Task.findByIdAndDelete(taskId);

    // Touch project updatedAt for latest activity
    await Project.findByIdAndUpdate(task.projectId, { updatedAt: new Date() });

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
}
