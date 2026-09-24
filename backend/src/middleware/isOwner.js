export function isOwner(Model, ownerField = "ownerId", params = "id") {
    return async function(req, res, next) {
        try {
            const paramKey = params || "id";
            const resourceId = req.params[paramKey];
            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    message: "Resource not found",
                });
            }

            const ownerValue = resource[ownerField];
            const ownerId = ownerValue?._id ? ownerValue._id.toString() : ownerValue?.toString();

            if (ownerId !== req.userId.toString()) {
                return res.status(403).json({
                    message: "Only the owner can perform this action",
                });
            }
            req.resource = resource;
            next();
        } catch (error) {
            return res.status(403).json({
                message: "Authorization check failed",
            });
        }
    };
}