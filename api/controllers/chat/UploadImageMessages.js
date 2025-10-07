import multer from 'multer';
import { nanoid } from 'nanoid';

import path from 'path';
import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import { io } from '../../index.js';

// ===== Multer storage config =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid(10)}-${Date.now()}${ext}`);
    }
});

// ===== Multer instance for multiple files =====
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, please select a valid image!'), false);
        }
    }
});

// ===== Cloudinary upload with progress =====
const uploadToCloudinaryWithStream = (filePath, socketId, progressEventName, pos,msgId,room,callback) => {
    const fileSize = fs.statSync(filePath).size;
    let uploadedBytes = 0;

    const fileStream = fs.createReadStream(filePath);
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'chatapp/messages',type:'private' },
        (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        }
    );

    const userSocket = io.sockets.sockets.get(socketId);

    fileStream.on('data', (chunk) => {
        uploadedBytes += chunk.length;
        const progress = Math.round((uploadedBytes / fileSize) * 100);

        if (userSocket) {
            userSocket.emit(progressEventName, { progress, pos,chat:{msgId,room},fileName: path.basename(filePath) });
        }
    });

    fileStream.pipe(uploadStream);
};

// ===== Middleware for multiple images =====
export default function UploadImageMessages(req, res, next) {
    const uploadMultiple = upload.array('images', 5); // allow max 5 images at once

    uploadMultiple(req, res, async (err) => {

    
        if (err) return res.status(500).json({ err: 'Error while uploading!' });

        if (!req.files || req.files.length === 0) {
            return next();
        }

        const { socket,msg:msgId,room } = req.body;
        console.log('request body of upload :' ,req.body);
        if (!socket || !msgId) return res.status(400).json({ err: 'Invalid request or Live connection not found!' });

        let uploadedImages = [];
        try {
            let index=0;
            for (let file of req.files) {
                index++;
                const pos = {current:index,total:req.files.length}
                await new Promise((resolve, reject) => {
                    uploadToCloudinaryWithStream(file.path, socket, 'multi-upload-prog',pos,msgId,room,(error, result) => {
                        // delete temp file after upload
                        fs.unlink(file.path, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
                        });

                        if (error) return reject(error);

                        uploadedImages.push({
                            originalName: file.originalname,
                            cloud_id: result.public_id
                        });
                        resolve();
                    });
                });
            }

            req.uploadedImages = uploadedImages; // attach uploaded images info
            return next();
        } catch (error) {
            console.log('Upload Error :',error);
            // remove temp files saved to server
            let status=  500;
            let reason = 'Unexpected Error !';
            if(error.name === 'RequestError' || error.code === 'ENOTFOUND'){
                status=503;
                reason='Network error while saving to cloud !';
            }else if(error.http_code){
                status=error.http_code;
                reason = `CloudError : ${error.message}`;
            }
            for (let file of req.files) {
                fs.unlink(file.path,(err)=>{
                    if(!err) return console.log(' removing temp file :',file.path);
                    console.log(err)
                });
            } 
            return res.status(status).json({message:'cloud upload failed !' ,err: reason});
        }
    });
}
