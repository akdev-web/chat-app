import { useRef } from "react";
import indexDB, { indexDBTranstion } from "../util/IndexDb";
import { addPendingMsgIndexDB, getAllPendingMsgIndexDB, removePendingMsgIndexDB, replacePendingMsgIndexDB, updatePendingMsgIndexDB } from "../util/pendingMsgDBUtil";
import { useEffect } from "react";
/**
 * Utility hook for managing pending messages in memory (not UI state).
 * Uses Map internally for fast add/remove/lookup.
 */
export function usePendingMessages(selectedChat) {
    const pendingRef = useRef(new Map());

    useEffect(()=>{
        const fetchResultFromStorage = async()=>{
            const records = await getAllPendingMsgIndexDB();
            pendingRef.current =  new Map(records.map(record=>[record.msgId||record.pid,record]));
        }
        if(selectedChat){
           fetchResultFromStorage();
        }
    },[selectedChat]);

    // Add a pending message
    const addPending = (msgId, data, status = "pending") => {
        if (pendingRef.current.has(msgId)) {
            return { success: false, reason: "Message already exists" };
        }
        
        pendingRef.current.set(msgId, { status, ...data });

        addPendingMsgIndexDB(msgId,{status,...data})
        console.log('added pending Ref : ', getAllPending());
        return { success: true };
    };

    // Update a pending message
    const updatePending = (msgId, updates) => {
        const existing = pendingRef.current.get(msgId);
        if (!existing) {
            return { success: false, reason: "Message not found" };
        }
        pendingRef.current.set(msgId, { ...existing, ...updates });
        console.log(' after update :',getAllPending());
        updatePendingMsgIndexDB(msgId,updates);
        return { success: true, updated: pendingRef.current.get(msgId) };
    };

    // Remove a pending message
    const removePending = (msgId) => {
        if (!pendingRef.current.has(msgId)) {
            return { success: false, reason: "Message not found" };
        }
        pendingRef.current.delete(msgId);
        removePendingMsgIndexDB(msgId);
        console.log('removed pendig',getAllPending());
        return { success: true };
    };

    const replacePending = (currentId,newId,data) =>{
        let rem_res = removePending(currentId);
        let  add_res = addPending(newId,data);

        console.log('after replace',getAllPending());
        if(rem_res.success && add_res){ return {success:true}}
    }

    // Get one pending message
    const getPending = (msgId) => {
        const msg = pendingRef.current.get(msgId);
        return msg ? { success: true, message: { id: msgId, ...msg } }
            : { success: false, reason: "Message not found" };
    };

    // Get all pending messages
    const getAllPending = () => {
        return Array.from(pendingRef.current.entries()).map(([id, data]) => ({
            id,
            ...data,
        }));
    };

    // Filter by status (e.g., "sending", "ack", "read")
    const getByStatus = (status) => {
        return Array.from(pendingRef.current.entries())
            .filter(([_, data]) => data.status === status)
            .map(([id, data]) => ({ id, ...data }));
    };

    return {
        addPending,
        updatePending,
        removePending,
        replacePending,
        getPending,
        getAllPending,
        getByStatus,
    };
}
