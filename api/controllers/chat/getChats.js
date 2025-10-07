import chatgroup from "../../models/chatModels/chatgroup.js";
import message from "../../models/chatModels/message.js";

export default async function getChats(req, res) {
    const { user } = req;
    const chatId = user.userId;
    try {
        const updatedeliverd = await message.updateMany(
            {

                receiver: user.userId,
                state:'sent',
            },
            [
                {
                    $set: {
                        state:'delivered',
                    }
                }
            ]
        );
        const chats = await chatgroup.aggregate([
            {
                $match: {
                    $expr:{
                        $or:[
                            {$in:[user.userId,'$members']},
                            { $in: [user.userId, { $ifNull: ['$invites', []] }] }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { room: '$room', user: user.userId,system:'system' },
                    pipeline: [
                        {
                            $match: { $expr: { 
                                $and:[
                                    {$eq: ['$room', '$$room']},
                                ] 
                            } },
                        },
                        {
                            $sort: { timestamp: -1 },
                        },
                        { $limit: 1 },
                        {
                            $addFields: {
                                fromMe: {
                                    $cond: [
                                        { $eq: ["$sender", "$$user"] },
                                        true,
                                        false
                                    ]
                                }
                            }
                        },
                        {
                            $project: { _id: 0 }
                        }

                    ],
                    as: 'chat'
                }
            },
            {
                $unwind: {
                    path: '$chat',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {
                        roomtype: '$type', sender: '$chat.sender',
                        members: '$members', user: user.userId
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        {
                                            $eq: ["$$roomtype", 'personal']
                                        },
                                        {
                                            $and: [
                                                { $in: ['$liveId', "$$members"] },
                                                { $ne: ['$liveId', '$$user'] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $ne: [{ $ifNull: ['$$sender', null] }, null] },
                                                { $eq: ['$liveId', '$$sender'] },
                                            ]
                                        }

                                    ]

                                }
                            }
                        }
                    ],
                    as: 'userdata'
                }
            },
            {
                $unwind: {
                    path: '$userdata',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields:{

                    isPersonal:{$eq:['$type','personal']},
                    isAdmin :{
                        $cond:[
                            {$in:[chatId,"$admins"]},
                            true,
                            {$cond:[
                                {$eq:['$type','personal']},
                                "$$REMOVE",
                                false
                            ]}       
                        ]
                    },
                    isOwner :{
                        $cond:[
                            {$eq:[chatId,"$owner"]},
                            true,
                            {$cond:[
                                {$eq:['$type','personal']},
                                "$$REMOVE",
                                false
                            ]}       
                        ]
                    },
                    isInvited: {
                        $cond: {
                            if: {
                            $and: [
                                { $in: [chatId, "$invites"] },
                                { $not: { $in: [chatId, "$members"] } }
                            ]
                            },
                            then: true,
                            else: {
                            $cond: {
                                if: { $eq: ["$type", "personal"] },
                                then: "$$REMOVE",
                                else: false
                            }
                            }
                        }
                    }
                }
            },
            {
                $sort:{"chat.timestamp":-1}
            },
            {
                $project: {
                    _id: 0,
                    room: 1,
                    members: 1,
                    username:
                        "$userdata.username",
                    user: {
                        name: '$userdata.username',
                        profile:'$userdata.profile.url',
                        userId: '$userdata.liveId',
                    },
                    group: '$type',
                    groupName: "$name",
                    groupDesc: "$desc",
                    groupProfile:{
                        $cond:[
                            { $eq: [{ $ifNull: ['$profile', null] }, null] },
                            "$profile",
                            "$profile"
                        ]
                    },
                    isPersonal:1,
                    isAdmin:1,
                    isOwner:1,
                    lastchat: {
                        $cond: [
                            { $eq: [{ $ifNull: ['$chat', null] }, null] },
                            {
                                text: 'No messages yet ',
                                timestamp: null,
                            },
                            {
                                text: {$cond:[
                                    {$eq:['$chat.state','deleted']},
                                    {$cond:[
                                        {$eq:['$chat.fromMe',true]},
                                        'You deleted this message',
                                        'This message was deleted'
                                    ]}
                                    ,'$chat.text'
                                ]},
                                timestamp: "$chat.timestamp",
                                state: "$chat.state",
                                fromMe: "$chat.fromMe",
                            }
                        ]
                    },
                    chatImages:'$chatImages'
                }
            },

        ]);
        return res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: 'unexpected Error' });
    }
}