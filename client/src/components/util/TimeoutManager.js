const timouts = new Map();

export const TimeOutManager={
    add(key,callback,delay=10000){
        if(timouts.has(key)) clearTimeout(key);
        
        const id = setTimeout(()=>{
            callback?.();
            timouts.delete(key);
        },delay)
        timouts.set(key,id);
        return id;
    },
    remove(key){
        const id = timouts.get(key);
        if(id){
            clearTimeout(id);
            timouts.delete(id);
            
            return true;
        }else return false;
    },
    get(key){
        return timouts.get(key)
    },
    clearAll(){
        for (const id of timouts.values()) {
            clearTimeout(id);
        }
        return timouts.clear();
    }

}