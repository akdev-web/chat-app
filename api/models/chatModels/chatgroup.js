import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

const participantsSchema = new mongoose.Schema({
  userId:{
    type:String,
    required:true,
    ref:'User'
  },
  role:{
    type:String,
    enum:['admin','member'],
    default:'member'
  },
  status:{
    type:String,
    enum:['accepted','rejected','invited'],
    default:'accepted'
  }
},{_id:false})

const ChatGroupSchema = new mongoose.Schema({
  members: [{ type: String, ref: 'User' }],
  admins: [{ type: String, ref: 'User' }],
  invites: [{ type: String, ref: 'User' }],
  participants:[participantsSchema],
  owner:{type:String,ref:'User',},
  room:{type:String,unique:true,default: ()=>uuid()},
  profile:{type:String},
  name:{type:String,required:true},
  desc:{type:String},
  type:{type:String,default:"private"},
},{timestamps:true});


export default mongoose.models.chatgroup || mongoose.model('chatgroup', ChatGroupSchema);
