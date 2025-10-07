import React, { useEffect, useRef, useState } from 'react'
import useUserContext from '../../context/UserContext'
import { useLocation } from 'react-router-dom';
import ToastMsg from '../../components/util/AlertToast';
import UserAvatar from '../../components/util/UserAvatar';
import { TbColorPicker } from 'react-icons/tb'
import api from '../../components/api';
import useSocket from '../../context/SocketContext';

const Profile = () => {
  const { user } = useUserContext();
  const  {socket, isSocketconnected } = useSocket(); 
  const location = useLocation();
  const loaded = useRef(false);
  const [profileImg, setProfileImg] = useState(null);
  const [alert, setAlert] = useState(null);


  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadstate] = useState('idle');
  const [socketConn,setSocketConn] = useState(null);

  useEffect(()=>{
    if(!socket.current || !isSocketconnected){
      return setSocketConn(null);
    }
    setSocketConn(socket.current);


    socket.current.on('upload-prog',({progress})=>{
      console.log('saving... ',progress,'%');
      setUploadstate('saving');
      setUploadProgress(progress);
    })
  },[socket.current,isSocketconnected]);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (location?.state) {
      ToastMsg(location.state.alert);
    }
  }, [])

  const allowedImageFileExt = [
    'image/png', 'image/jpg', 'image/jpeg'
  ]
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setProfileImg(null);
    if (file && !allowedImageFileExt.includes(file.type)) {
      setAlert({ type: 'err', msg: 'Unsupport file type ! please use jpg , jpeg or png ext. files ' });
      return e.target.value = '';
    }
    setProfileImg({ preview: URL.createObjectURL(file), file: file });
  }

  const updateProfile = async (e) => {
    e.preventDefault();
    setUploadstate('uploading');
    setUploadProgress(0);

    if (!profileImg?.file) {
      return setAlert({ type: 'err', msg: 'Please Select a image !' });
    }
    const data = new FormData();
    data.append('profile', profileImg.file);
    socketConn && data.append('socket',socketConn?.id);
    try {
      const res = await api.post('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progress) => {
          const prog = Math.round((progress.loaded * 100) / progress.total);
          setUploadProgress(prog);
        }
      },
      );
      
      if (res.data.success) {
        let data = res.data;
        setAlert({ type: 'success', msg: data.msg });
        console.log(data.user);
        setUploadstate('done');
      }
    } catch (error) {
      console.log(error);
      setUploadstate('error');
    }
  }
  return (
    <>
      {
        user &&
        <form className='mx-auto max-w-[400px] bg-[var(---color-bg)] rounded-md shadow-md p-4 flex flex-col gap-2.5 items-center'>
          <div className="p-4 space-y-2">
            {uploadState === "uploading" && (
              <div>
                <p>Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {uploadState === "saving" && (
              <p className="text-yellow-500">Saving... {uploadProgress}%</p>
            )}
            {uploadState === "done" && (
              <p className="text-green-600">Upload complete!</p>
            )}
            {uploadState === "error" && (
              <p className="text-red-600">Upload failed!</p>
            )}
          </div>

          {alert?.msg &&
            (
              alert.type === 'err' ?
                <p className='my-2 px-2 py-1 text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)]'>{alert.msg}</p>
                :
                <p className='my-2 px-2 py-1 text-sm text-[var(--color-success-text)] bg-[var(--color-success-bg)]'>{alert.msg}</p>
            )
          }
          <div className='relative my-5 '>
            {
              profileImg ?
                <img className='rounded-full h-[120px] w-[120px] object-cover' src={profileImg.preview} alt="" />
                :
                <UserAvatar profile={user.profile} name={user.username} size={120} />
            }
            <label htmlFor="profilePicker">
              <TbColorPicker size={32} color='green' className='absolute border-l-2 border-t-2  cursor-pointer bottom-0 -right-2.5 bg-[var(---color-bg)] rounded-full p-1' />
            </label>
            <input id='profilePicker' type="file" accept='.jpg,.png,.jpeg' multiple={false} onChange={handleProfileChange} hidden />
          </div>
          <div>
            <div>{user.username}</div>
            <div>{user.email}</div>
          </div>
          <button className='bg-black text-white p-2' onClick={updateProfile}>Save Changes</button>
        </form>
      }
    </>
  )
}

export default Profile