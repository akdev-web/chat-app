import jwt from 'jsonwebtoken'
import connectDB from '../../config/conn.js';
import users from '../../models/user.js';
export default async function VerifySocketAccess(socket,next) {
    const auth = socket.handshake.auth?.token;
    if(auth){
        try {
            const payload = jwt.verify(auth,process.env.USER_TOKEN_SECRET);
            if(payload){

                await connectDB();
                const {username,email} = payload.user;
                const user = await users.findOne({email:email}).select('-password');
                if(!user){
                    console.log('request not found');
                    return next(new Error('Request Not Found'));
                }
                socket.authorized=true;
                // socket.data.user = {email,username,userId:user.liveId};
                socket.data.user = {email,username,userId:user.liveId};
                return next()
            }
        } catch (error) {
            console.log('unexpected error',error);
            return next(new Error('Unexpected Error !'));
        }
    }
    return next(new Error('Unauthorized Request'));   
}