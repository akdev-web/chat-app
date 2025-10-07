import React from 'react'
import { useEffect } from 'react'
import api from '../../../components/api'
import { useState } from 'react'

const ChatImage = ({file :{file,filename}}) => {
    const [image,setImage] = useState({loading:false,url:null});
    useEffect(()=>{
        (async()=>{
                setImage({loading:true,url:null});
            try {
                const res = await api.get(`cloud/chatImage`,{params:{file},
                    responseType:'blob'
                })
                if(res.status === 200){
                    setImage({loading:false,url:URL.createObjectURL(res.data)});
                }  
            } catch (error) {
                const errMessage = error.response.data?.err || error.message ;
                setImage({err:errMessage,loading:false,url:null});
                console.log(error);
            }
        })();
    },[file])


    if(image.loading){    
        return ( 
            <>
                <div>Loading ....</div>
            </>
        )
    }

  return (
     
    <>
    {
    image.err ?
        <p>{image.err}</p>
    :
    image.url && <img className='rounded-2xl' src={image.url} alt={filename} />
    }
    </> 
  )
}

export default ChatImage