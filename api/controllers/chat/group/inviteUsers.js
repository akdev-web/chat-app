import chatgroup from "../../../models/chatModels/chatgroup.js";
import messages from "../../../models/chatModels/message.js";

export default async function inviteUsers (req,res){
    const {user} = req;
    const {users,room} = req.body;

    if(!users || !room) return res.status(400).json({err:'Bad Request !'});
    try {

        await chatgroup.updateOne(
            {room},
            {
                $addToSet:{
                    invites:{$each:users}
                }
            }
        )
        
        const inviteMessages = users.map(usr => ({
            sender:'system',
            receiver:usr,
            text:`${user.username} Invites you to join this Group .`,
            room:room
         }));

        await messages.insertMany(inviteMessages);
        return res.status(200).json({success:true,msg:'Invitation messages sent succesfully !'});

    } catch (error) {
        return res.status(500).json({err:'Unexpected Error !'});   
    }
}

