import chatgroup from "../../../models/chatModels/chatgroup.js";
import redis from "../../../redis/redisClient.js";

async function membersFromDB(room) {
    try {
        const group = await chatgroup.findOne({room}).select('members');
        console.log(group);
        return group.members;
    } catch (error) {
        throw new Error('Unexpected Error');
    }     
}

export default async function getMembersFromRedisCache(room) {
    if(!room) return;

    const groupKey = `group:${room}:members`;

    let members = await redis.sMembers(groupKey);

    if(members.length === 0){
        // no group cache in redis , get  members from db
        members = await membersFromDB(room);

        if(members?.length > 0){

            console.log('updating redis members :',members);
          
            await redis.sAdd(groupKey,members);
            await redis.expire(groupKey,300);
            return members;
        }
    }else return members;

}