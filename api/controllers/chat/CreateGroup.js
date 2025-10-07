import chatgroup from "../../models/chatModels/chatgroup.js";

export default async function CreateChatGroup(req,res) {
    const {user} = req;
    const {groupName,groupDesc,groupPrivacy} = req.body;

    console.log('Create Group Message : ',groupDesc,groupName,groupPrivacy,user);

    try {
        const group = new chatgroup({
            name:groupName,
            desc:groupDesc,
            type:groupPrivacy,
            members:[user.userId],
            admins:[user.userId],
            owner:user.userId,
            profile:req.file?.cloudinaryUrl
        });

        const newgroup = await group.save();
        return res.status(200).json({success:true,msg:'Group is Created Successfully',data:newgroup});
    } catch (error) {
        console.log(error);
        return res.status(500).json({err:'Unexpected Error'});
    }
}