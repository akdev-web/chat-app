import message from "../../models/chatModels/message.js";
import users from "../../models/user.js";
export default async function Knowns(req, res) {
    const { user } = req;
    try {
        const knowns = await users.aggregate([
            {
                $match: { _id: { $ne: user.id } }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    userId: "$liveId",
                    profile: "$profile.url",
                    _id: 0
                }
            }
        ])
        return res.status(200).json({ success: true, data: knowns });
    } catch (error) {
        console.log(error);
        return res.status(500).json('Unexpected Error');
    }
}