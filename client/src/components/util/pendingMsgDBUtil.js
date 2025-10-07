import { indexDbPendingMessage, indexDBTranstion } from "./IndexDb";


export function getPendingMsgIndexDB(id) {
    return indexDbPendingMessage('readonly', (store, resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = (e) => {
            const record = e.target.result;
            if (!record) return reject(new Error("No record found"));
            resolve(record);
        };
        request.onerror = (e) => reject(new Error(`Failed to get: ${e.target.error}`));
    })
}

export function getAllPendingMsgIndexDB() {
    return indexDbPendingMessage('readonly', (store, resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = (e) => {
            let record = e.target.result || [];
            return resolve(record)
        }
        request.onerror = (e) => {
            request.onerror = (e) => reject(new Error(`Failed to get all: ${e.target.error}`));
        }
    })
}

export function addPendingMsgIndexDB(id, msg) {

    return indexDbPendingMessage('readwrite', (store, resolve, reject) => {
        let putRequest = store.put({ id, ...msg });
        putRequest.onsuccess = (e) => {
            let record = e.target.result;
            return resolve(record)
        }
        putRequest.onerror = (e) => { return reject(new Error(`Failed to add : ${e.target.error}`)) }
    })
}

export function removePendingMsgIndexDB(id) {
    return indexDbPendingMessage("readwrite", (store, resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(id);
        request.onerror = (e) => reject(new Error(`Failed to delete: ${e.target.error}`));
    });
}

export async function updatePendingMsgIndexDB(id, update) {
    const record = await getPendingMsgIndexDB(id).catch(()=>null);
    if (!record) throw new Error("No record found to update");
    return indexDBTranstion('readwrite', (store, resolve, reject) => {
        const request = store.put({ ...record, ...update });
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(new Error(`Failed to update: ${e.target.error}`));
    })
}

export async function replacePendingMsgIndexDB(oldId, newId, data) {
    const record = await getPendingMsgIndexDB(id).catch(()=>null);
    if (!record) throw new Error("No record found to update");

    await removePendingMsgIndexDB(oldId);
    return addPendingMsgIndexDB(newId,data);
}