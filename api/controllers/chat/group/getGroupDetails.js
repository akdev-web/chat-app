
import chatgroup from "../../../models/chatModels/chatgroup.js";

export default async function getGroupDetails(req,res) {
    const {user} = req;
    const group_room = req.params.room;
    
    try {
        const groupDetails = await chatgroup.aggregate([
            {
                $match:{room:group_room}
            },
            {
                $addFields:{
                    isOwner:{
                        $eq:[user.userId,"$owner"]
                    }
                }
            },
            {
                $lookup:{
                    from:'users',
                    let:{members:'$members',admins:"$admins"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{$in:['$liveId','$$members']}
                            }
                        },
                        {
                            $addFields:{
                                isAdmin:{
                                        $in:['$liveId',"$$admins"]
                                }
                            }
                        },
                        {
                            $project:{
                                _id:0,
                                name:"$username",
                                profile:'$profile',
                                isAdmin:1,
                                userId:"$liveId"
                            }
                        }
                    ],
                    as:'members'
                }
            },
            {
                $project:{
                    _id:0,
                    isOwner:1,
                    groupName:'$name',
                    groupDesc:'$desc',
                    groupPrivacy:'$type',
                    profile:1,
                    members:1,
                    room:1,
                }
            }
        ]);
        return res.status(200).json({success:true,groupDetails:groupDetails[0]||nul});
    } catch (error) {
        console.log(error);   
        return res.status(500).json({err:'Unexprected Error'});
    }
}