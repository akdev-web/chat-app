import { useContext } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
import useUserContext from "./UserContext";
import { useState } from "react";


const SocketContext = createContext();

export function SocketProvider({children}){
    const {user,authenticating} = useUserContext();
    const socket = useRef(null);
    const [isSocketconnected,setSocketConnected] = useState(false);


    useEffect(()=>{
        if(authenticating || !user) return;
        const token = localStorage.getItem('access_Token');
        if(!token) return;
        const connec = io('http://localhost:3000',{
            withCredentials:true,
            auth:{token}
        });

        connec.on("connect_error", (err) => {
            console.log('connection errror : ',err.message); // prints the message associated with the error
        });
        socket.current = connec;

        let keepConnId ;
        connec.on('connect',()=>{
            setSocketConnected(true);   
            keepConnId = setInterval(()=>{
                    connec.emit('keep-conn');
            },40000)  
        })

        connec.on('connected',(data)=>{
            socket.current.user = data.user;
        })


        connec.on('disconnect',(err)=>{
            clearInterval(keepConnId);
            setSocketConnected(false);
            console.log('you are disconnected',err);
        });

        
        return ()=>{
            clearInterval(keepConnId);
            connec.disconnect();
            socket.current = null;
        };
    },[user]);


    return(
        <SocketContext.Provider value={{socket:socket,isSocketconnected}} >
             {children}
        </SocketContext.Provider>
    )

} 

const useSocket = ()=>useContext(SocketContext);
export default useSocket;