import { useEffect, useState } from "react";
import useSocket from "../../context/SocketContext";
import { chat } from "../api";

export default function useUpload({ validateFunc= null, progressUpdater= null }) {
  const { socket, isSocketconnected } = useSocket();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadstate] = useState('idle');
  const [upl_Response, setUpl_Response] = useState(null);

  useEffect(() => {
    const conn = socket.current;
    if (!isSocketconnected || !conn) {
      return ;
    }


    conn.on('upload-prog', ({ progress}) => {
      console.log('saving... ', progress, '%');
      setUploadstate('saving');
      setUploadProgress(progress);
    })

    conn.on('multi-upload-prog', ({ progress,pos,chat,fileName  }) => {
      let progMessage = `${pos.current} of ${pos.total} (${fileName})`;
      console.log('saving... ', progress, '%');
      setUploadstate('saving');
      setUploadProgress(progress);
      progressUpdater({prog:progress,state:'saving',progMessage,chat})
    })
  }, [socket.current, isSocketconnected]);

  const upload = async({ e, uploadUrl, formdata, file }) => {
    e?.preventDefault();

    // validate inputs 
    // here ..........
    if (validateFunc) {
      const error = validateFunc();
      if (error) return setUpl_Response(error);
    }

    setUploadstate('uploading');
    setUploadProgress(0);

    setUpl_Response(null);


    const data = new FormData();
    Object.entries(formdata).forEach(([field, value]) => {
      data.append(field, value);
    })
    if (file) {
      if (Array.isArray(file.value)) {
        file.value.map((f) => {
          data.append(file.field, f)
        })
      }
      else data.append(file.field, file.value);
    }

    console.log('formdata', data)
    isSocketconnected && data.append('socket', socket.current.id);
    
    return new Promise(async (resolve,reject)=>{

      try {
        const res = await chat.post(uploadUrl, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progress) => {
            const prog = Math.round((progress.loaded * 100) / progress.total);
            setUploadProgress(prog);
            let progMessage = `uploading... `;
            progressUpdater({prog,state:'uploading',progMessage,chat:(data)})
          }
        },
        );

        if (res.data.success) {
          let data = res.data;
          setUpl_Response(data);
          setUploadstate('done');
          resolve(data);
        }
      } catch (error) {
        const err = !navigator.onLine ? 'No Internet Connection !' 
                    : error.response?.data?.err || 
                    (error.request ? 'server not responding !' : error.message ) ;
        console.log(err);
        setUploadstate('error');
        setUpl_Response(err);
        reject(err);
      }
    })
  }

  const resetUpload = () => {
    setUploadstate('idle')
    setUploadProgress(0)
    setUpl_Response(null)
  }

  return {
    uploadProgress,
    uploadState,
    upl_Response,
    upload,
    resetUpload,
  }
}