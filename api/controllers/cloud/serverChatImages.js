import axios from "axios";
import cloudinary from "../../config/cloudinary.js";

export default async function serveChatImages(req,res) {
    const file = req.query.file;
    
    try {
        
        const url = cloudinary.url(file,{type:'private',sign_url:true});
        const response = await axios.get(url,{responseType:'arraybuffer'});

        const contentType = response.headers['content-type'];
        const contentLength = response.headers['content-length'];
        res.set({
            'Content-Type':contentType,
            'Content-Length':contentLength
        })
        res.send(response.data);

    } catch (error) {
        res.send(error);
       console.log(error); 
    }
}