import chatgroup from "../../../models/chatModels/chatgroup.js";

export default async function updateChatGroup(req,res) {
    const {user} = req;
    const {groupName,groupDesc,groupPrivacy,room} = req.body;

    console.log('Update Group : ',room);
    try {
        const group = await chatgroup.findOne({room});
        group.name=groupName;
        group.desc=groupDesc;
        group.type=groupPrivacy;
        group.profile= req.file ? req.file.cloudinaryUrl : group.profile 

        const updated = await group.save();
        return res.status(200).json({success:true,msg:'Group is Updated Successfully',data:updated});
    } catch (error) {
        console.log(error);
        return res.status(500).json({err:'Unexpected Error'});
    }
}