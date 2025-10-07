import connectDB from "../../config/conn.js";
import users from "../../models/user.js";

export default async function Profile(req,res) {
    const {email,username} = req.user;

    try {
        await connectDB();
        const user = await users.findOne({email},{_id:0,email:1,username:1,profile:"$profile.url"});
        if(!user){return res.status(400).json({err:'cannot process request at this moment !'})};
        return res.status(200).json({success:true,msg:'accessed',user:user});
    } catch (err) {
        console.log(err);
        return res.status(500).json({err:'Unexpected Error'});
    }
}