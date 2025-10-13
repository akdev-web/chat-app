import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: String, ref: 'users',required:true },
  receiver: { type: String, ref: 'users' },
  room: {type:String,ref:'Conversation',required:true},
  text: {type:String},
  state:{ type:String,
    enum:['pending','uploading','sent','delivered','read','failed','deleted'],
    default:'pending'
  },
  pid:{type:String,unique:true,sparse:true},
  images:[
    { 
      _id:false,
      file:{type:mongoose.Schema.ObjectId,ref:'ChatImages'},
      filename:{type:String,default:null},
      state:{type:String},
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
