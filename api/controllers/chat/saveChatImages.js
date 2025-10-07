import { io } from "../../index.js";
import messages from "../../models/chatModels/message.js";
import Chatimage from '../../models/chatModels/ImageModel.js'
import { emitMessageUpdate } from "./util/msgEmitter.js";

export default async function saveChatImages(req,res) {
    const {user,uploadedImages} = req;
    const {msg:msgId,socket:socketId} = req.body;
    try {
        
        const message = await messages.findById(msgId);
        if(!message) return ;
        
        const chatImages = uploadedImages.map(img=>{
            return {
                message:message._id,
                cloudId:img.cloud_id,
                filename:img.originalName}
        });

        const newChatImages = await Chatimage.create(chatImages);

        message.images = newChatImages.map((img)=>({ file:img._id} )); // insert image doc _id to messages's images array
        message.state = 'sent';
        await message.save()

        const {_id,...msg} = message.toObject(); // replace or rename _id to msgId
        msg.msgId = _id;
        

        msg.images = newChatImages.map((img)=>({file:img.cloudId,filename:img.filename})); // replace images _id with images data  array
        

        // emit images upload update to all 
        io.to(message.room).emit('update-chat',msg);

        // emit upload ack to sender
        const senderSocket = io.sockets.sockets.get(socketId);
        senderSocket.emit('msg-upload-ack',{msgId:msg.msgId});

        emitMessageUpdate({
            room:message.room,
            message:msg,
            from:user.userId
        })
        
        return res.status(200).json({success:true,chat:msg});
            
    } catch (error) {
        console.log(error);
        return res.status(500).json({err:'unexpected Error !'});
    }

    
}