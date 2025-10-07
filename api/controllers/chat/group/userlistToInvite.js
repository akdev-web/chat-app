import chatgroup from '../../../models/chatModels/chatgroup.js';
import users from '../../../models/user.js';

export default async function userlistToInvite(req,res) {
    const {user} = req;

    const room = req.query.group;
    if(!room) return res.status(400).json('Bad Request');

    try {
        const group = await chatgroup.findOne({room}).select('members');
        if(!group) return res.status(400).json('Bad Request');

        const userList = await users.aggregate([
            {
                $match:{
                    $expr:{$ne:[{$in:['$liveId',group.members]},true]}
                }
            },
            {
                $project:{
                    _id:0,
                    name:"$username",
                    userId:'$liveId',
                    profile:1,
                }
            }
        ])

        return res.status(200).json({success:true,users:userList});
    } catch (error) {
        console.log(error);
        return res.status(500).json({err:'Unexpected error !'});
    }
}