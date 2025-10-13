import React from 'react'
import { useEffect } from 'react'
import api from '../../../components/api'
import { useState } from 'react'
import { loadImage } from '../../../components/util/ChatImageCache'

const ChatImage = ({file :{file,filename},classes,stylesprop,onZoom,imgRef}) => {
    const [image,setImage] = useState({loading:false,url:null});
    useEffect(()=>{
        let imageUrl;
        (async()=>{
            loadImage({file,filename}).then((image)=>{
                if(image){
                    imageUrl = URL.createObjectURL(image.blob);
                    setImage({loading:false,url:imageUrl});
                }else{
                    setImage({loading:false,url:null,err:"Failed to load image"});
                }
            })
            .catch((err)=>{
                console.log(err);
                setImage({loading:false,url:null,err:err.message || "Failed to load image"});
            })
        })();

        return ()=>{
            if(imageUrl) URL.revokeObjectURL(imageUrl);
        }
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
        <p>Failed Load !</p>
    :
    image && 
        <>
            <img ref={imgRef} src={image.url} alt={filename} className={classes} style={stylesprop} 
                onWheel={onZoom} 
            />
        </>
    }
    </> 
  )
}

export default ChatImage