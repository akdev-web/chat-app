import ChatImage from "../../models/chatModels/ImageModel.js";
import cloudinary from "../../config/cloudinary.js";
import Message from "../../models/chatModels/message.js";

export default async function handleDeleteMessageFile(socket) {
    socket.on('delete-msg-file',async(data)=>{
        const {user} = socket.data;
        const {msg,file} = data;
        if(!msg || !file){ return socket.emit('error',{err:'Invalid delte Request'})}

        const check = await Message.findOne(
            { _id:msg, sender: user.userId,}
        ).populate('images.file');
        console.log(check);
        if(!check){ return socket.emit('error',{err:'Message not found or not yours'})}
        const imageFiles = check.images;
        const ImageDoc = imageFiles.find(img=>img.file.cloudId === file)?.file || null;
        if(!ImageDoc){ return socket.emit('error',{err:'File not found in message'})}
        console.log(ImageDoc);
        (async()=>{
            try {
                await cloudinary.uploader.destroy(ImageDoc.cloudId,{type:'private'});
            } catch (error) {
                console.log('Failed to delete from cloudinary',error);
            }
        })();
        const removeFileDb = await ChatImage.findByIdAndDelete(ImageDoc._id);
        if(!removeFileDb){ return socket.emit('error',{err:'Failed to delete file from db'})}
        const updateFileStatus = imageFiles.map(img=>{
            if(img._id === ImageDoc._id){
                return { ...img, file:null, filename:'[deleted]',state:'deleted'}
            }
            return img;
        })
        check.images = updateFileStatus;
        await check.save();
        console.log(removeFileDb, check)
        socket.emit('msg-file-deleted',{msg:check});
    })
}