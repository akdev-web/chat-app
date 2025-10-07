import chatgroup from "../../../models/chatModels/chatgroup.js";
import groupmessage from "../../../models/chatModels/groupmessage.js";

export default async function deleteGroup(req,res) {
    const {user} = req;
    const room = req.params.room;
    try {
        const isOwner =  await chatgroup.findOne({room:room,owner:user.userId});

        if(!isOwner) return res.status(400).json({err:'Unauthorized Request'});
    
        const removeChats = await groupmessage.deleteMany({room});

        const deletegroup = await chatgroup.findByIdAndDelete(isOwner._id);

        console.log(removeChats,deletegroup);
        if(removeChats && deletegroup){
            return res.status(200).json({success:true,msg:'Chat deleted succcessfully'});
        }
    } catch (error) {
        res.status(500).json({err:'Unexpected Error'});
    }
}