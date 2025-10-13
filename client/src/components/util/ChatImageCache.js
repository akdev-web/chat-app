import api from "../api";

function imageCache(){
    return new Promise((resolve,reject)=>{
        const request = indexedDB.open('Chat_Cache',1)
        request.onupgradeneeded = (e) =>{
            const db = e.target.result;

            if(!db.objectStoreNames.contains('chatImages')){
                const store = db.createObjectStore('chatImages',{keyPath:'file'});
                
            }
        }
        request.onsuccess = (e) => resolve(e.target.result)
        request.onerror = (e) => reject(e.target.error);
    })
};

export async function loadImage({file,filename}){
    const db = await imageCache();
    return new Promise((resolve,reject)=>{
        const tx = db.transaction('chatImages','readonly');
        const store = tx.objectStore('chatImages');

        const request = store.get(file) ;
        request.onsuccess = async(e) =>{ 
            let result = e.target.result;
            if(result) return resolve(result);

            // if not in cache db then request 
            try {
                const res = await api.get(`cloud/chatImage`,{params:{file},
                    responseType:'blob'
                })
                if(res.status === 200){
                    console.log(res.data)
                    let cacheImage = {blob:res.data,file,filename}; 
                    storeImage(cacheImage);
                    return resolve(cacheImage);
                }  
            } catch (error) {
                const errMessage = error.response.data?.err || error.message ;
                console.log(error);
            }
        }
        request.onerror = (e) =>{reject(e.target.error)} 
    })
}

export async function storeImage(img) {
  const db = await imageCache();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chatImages', 'readwrite');
    const store = tx.objectStore('chatImages');
    const request = store.put(img);

    request.onsuccess = (e) => resolve(e.target.result || null);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function removeImageCache(file){
    const db = await imageCache();
    return new Promise((resolve,reject)=>{
        const tx = db.transaction('chatImages','readwrite');
        const store = tx.objectStore('chatImages');
        const request = store.delete(file);
        request.onsuccess = (e) => resolve(true);
        request.onerror = (e) => reject(e.target.error);
    })
}