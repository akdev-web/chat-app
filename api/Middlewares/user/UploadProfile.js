import multer from 'multer';
import { nanoid } from 'nanoid';

import path from 'path';
import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import { io } from '../../index.js';

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'uploads/profiles')
    },
    filename: function(req,file,cb){
        const uniqueSuffix = nanoid(12);
        const ext = path.extname(file.originalname);
        cb(null,file.originalname.split('.')[0]+'_'+uniqueSuffix+ext)
    },
})

const upload = multer({
    storage:storage,
    limits:{
        fileSize:10*1024*1024,
    },
    fileFilter:function(req,file,cb){
        if(file && file.mimetype.startsWith('image/')){
            cb(null,true)
        }
        else { cb(new Error('Invalid file type please select valid image !'),false)};
    }
});

const uploadtoCloudinaryWithStream = (filepath,socket,callback)=>{
    const fileSize = fs.statSync(filepath).size;

    let uploadedBytes = 0;
    const fileStream = fs.createReadStream(filepath);

    const uploadStream = cloudinary.uploader.upload_stream(
        {folder:'chatapp/profiles'},
        (error,result)=>{
            if(error) return callback(error);
            callback(null,result);
        }
    )

    const userSocket = io.sockets.sockets.get(socket);
    fileStream.on('data',(chunk)=>{
        uploadedBytes += chunk.length;
        const progress = Math.round((uploadedBytes/fileSize) *100);

        userSocket.emit('upload-prog',{progress});
    })

    fileStream.pipe(uploadStream); 
}

export default async function UploadProfile (req,res,next){
 const uploadSingle = upload.single('profile');

 uploadSingle(req,res,
 async (err)=>{

    if(err) return res.status(500).json({err:'Error while uploading !'})  
    
    if(!req.file){
        return next();
    }
    // upload to cloudinary
    const {socket} = req.body;

    if(!socket) return res.status(400).json({err:'live Connection not found !'});
    uploadtoCloudinaryWithStream(req.file.path,socket,(error,result)=>{
        fs.unlink(req.file.path,(unlinkerr)=>{
            console.log(unlinkerr);
        })
        if(error){
            return res.status(500).json({err: 'Error while uploading to cloud'});
        }
        req.file.cloudinaryUrl = result.secure_url;
        req.file.cloud_id = result.public_id;
        next()
    })

 })
}