export default function indexDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("Chat_DB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Object store for pending messages
      if (!db.objectStoreNames.contains("pendingMessages")) {
        const store = db.createObjectStore("pendingMessages", { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("chat", "room", { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export function indexDBTranstion (mode,operation) {

  return new Promise(async(resolve,reject)=>{
    const db = await indexDB();
    const tx = db.transaction('pendingMessages',mode);
    const store = tx.objectStore('pendingMessages');

    try {
      operation(store,resolve,reject);
    } catch (error) {
      reject(error);
    }
  })
}

export function indexDbPendingMessage (mode,operation) {

  return new Promise(async(resolve,reject)=>{
    const db = await indexDB();
    const tx = db.transaction('pendingMessages',mode);
    const store = tx.objectStore('pendingMessages');

    try {
      operation(store,resolve,reject);
    } catch (error) {
      reject(error);
    }
  })
}
