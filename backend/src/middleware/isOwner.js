export function isOwner(Model, ownerField = "ownerId"){
    return async function(req,res,next){
        try{
            const resource = await Model.findById(req.params.id)

            if(!resource){
                return res.status(404).json({
                    message: "Resource not found",
                })
            }

            if(resource[ownerField].toString() !== req.userId.toString()){
                return res.status(403).json({
                    message: "Only the owner can perform this action"
                })
            }
            req.resource = resource;
            next();
        }
        catch(error){
            return res.status(403).json({
                message: "Authorization check failed",
            })
        }
    }
}