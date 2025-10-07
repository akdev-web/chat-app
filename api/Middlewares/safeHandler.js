
import { logError } from "../errorLogger.js";

export function safeHandler(socket,handler) {
    return async (data) => {
      try {
        await handler(data); // socket event 
      } catch (error) {
        logError(error, {
          originalUrl: "SOCKET_IO",
          method: "WS",
          ip: socket.handshake.address,
          headers: socket.handshake.headers,
        });

        console.log('Safe Handler Error: ', error);
        socket.emit('error', { err: 'Unexpected Error !' });
      }
    };
}

