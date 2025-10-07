import message from "../../models/chatModels/message.js";

export default function handleDeleteMessage(socket) {
    socket.on('delete-msg', async (msgId) => {
        const { user } = socket.data;
        try {
            const check = await message.findOneAndUpdate(
                { _id:msgId, sender: user.userId },
                { $set: {  state:'deleted'} },
                { new: true } // return updated doc
            );

            if (!check) {
                // No message found for this user
                return socket.emit("err", { err: "Message not found or not yours." });
            }

            // Send a clean response back to client
            socket.emit("msg-deleted", {
                msgId: check.msgId,
                status: check.state,
                deletedAt: new Date()
            });

        } catch (error) {
            console.error(error);
            socket.emit("err", { err: "Unexpected error while deleting message." });
        }
    })


}