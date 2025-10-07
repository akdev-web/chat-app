import { useState } from "react";

export default function useSelectImage({prev_image=null}) {
    let init =  prev_image ? {preview:prev_image,file:null} : null;
    const [image, setImage] = useState(init);
    const [alert,setAlert] = useState(null)

    const allowedImageFileExt = [
        'image/png', 'image/jpg', 'image/jpeg'
    ]
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return setImage(null);
        if (file && !allowedImageFileExt.includes(file.type)) {
            setAlert({ type: 'err', msg: 'Unsupport file type ! please use jpg , jpeg or png ext. files ' });
            return e.target.value = '';
        }
        setImage({ preview: URL.createObjectURL(file), file: file });
    }

    return {
        image,
        handleImageChange
    }
}