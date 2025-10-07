import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
    {
        message:{type:mongoose.Schema.ObjectId,ref:'messages'},
        filename:{type:String,required:true},
        cloudId:{type:String,required:true},
        uploadBy:{type:mongoose.Schema.ObjectId,ref:'users'},
    }
)

export default mongoose.models.Chatimages || mongoose.model('Chatimages',ImageSchema);