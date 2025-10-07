import mongoose from 'mongoose';

const GroupMessageSchema = new mongoose.Schema({
  sender: { type: String, ref: 'users' },
  pinneduser: { type: String, ref: 'users' },
  room: {type:String,ref:'Conversation'},
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.GroupMessage || mongoose.model('GroupMessage', GroupMessageSchema);
