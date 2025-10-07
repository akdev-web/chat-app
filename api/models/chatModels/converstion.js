import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  members: [{ type: String, ref: 'User' }],
  room:{type:String,required:true,unique:true},
  type:{type:String,required:true},
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
