import chatgroup from "../../models/chatModels/chatgroup.js";

export default function validateRoom(socket) {
    return async (data,next)=>{
        try {
            const {room} = data[0];
            const isValidRoom = await chatgroup.findOne({room});

            if(!isValidRoom) return socket.emit({err:'Invalid Room Request'});
            data[0].roomData=isValidRoom;
            next()
        } catch (error) { 
            console.log(error);  
            socket.emit({err:'Unexpected Error'});
        }
    }
    
}

export function validateRoomAndMember(socket) {
    return async (data,next)=>{
        try {
            const {room} = data[0];
            const isValidRoom = await chatgroup.findOne({
                room,
                members:{$in:[socket.data.user.userId]},
            });

            console.log('valid room and member');
            if(!isValidRoom) return socket.emit({err:'Invalid Room or member Request'});
            data[0].roomData=isValidRoom;
            next()
        } catch (error) { 
            console.log(error);  
            socket.emit({err:'Unexpected Error'});
        }
    }
    
}