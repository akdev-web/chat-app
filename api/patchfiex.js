import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import user from "./models/user.js";

async function assignChatIds() {
  await mongoose.connect("mongodb://localhost:27017/charcha");

  const users = await user.find({ liveId: { $exists: false } });

  for (const user of users) {
    user.liveId = uuidv4();
    await user.save();
    console.log(`Assigned chat_id to user: ${user._id}`);
  }

  console.log("✅ All missing chat_ids assigned.");
  mongoose.disconnect();
}

assignChatIds().catch(console.error);
