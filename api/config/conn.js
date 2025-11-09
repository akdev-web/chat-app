import mongoose from 'mongoose';

export default async function connectDB(){
    try {
        // const conn = await mongoose.connect('mongodb://localhost:27017/chat_app');
        const conn = await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster.qsuuaub.mongodb.net/?appName=Cluster`)
        if(conn){
            console.log('database connected !');
        }
    } catch (error) {
        console.log('Connection Error : ',error);
    }
}    