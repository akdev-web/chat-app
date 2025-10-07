import React from 'react'
import { useReducer } from 'react'
import { chat } from '../../../components/api'
import { useState } from 'react'
import useUpload from '../../../components/hooks/UploadHook'
import useSelectImage from '../../../components/hooks/SelectImageHook'
import { TbColorPicker } from 'react-icons/tb'
import UserAvatar from '../../../components/util/UserAvatar'

const GroupForm2 = ({ group = null }) => {


    let initialForm = {
        groupName: '',
        groupDesc: '',
        groupPrivacy: 'private',
    }

    if (group) {
        let { members, isAdmin, profile, ...init } = group;
        initialForm = { ...initialForm, ...init }
    }
    const formReducer = (state, action) => {
        switch (action.type) {
            case 'set':
                return { ...state, [action.field]: action.value }
            case 'reset':
                return initialForm
            default:
                return state;
        }
    }
    const [form, setForm] = useReducer(formReducer, initialForm)

    console.log(form);


    const validateForm = () => {
        if (form.groupName.length < 3) {
            return { type: 'err', msg: 'Group Name should atleast contains 3 charcters' };
        } else if (!['public', 'private'].includes(form.groupPrivacy)) {
            return { type: 'err', msg: 'Please Select a Group Privacy' };
        }
        return null;
    }

    const { uploadProgress, uploadState, upl_Response, upload, resetUpload } = useUpload({ validateFunc: validateForm });
    const { image, alert, handleImageChange } = useSelectImage({prev_image:group?.profile});

    return (
        <>
            <form onSubmit={(e) => upload({ e, uploadUrl: group ? `/group/${group.room}` : '/group/new', formdata: form, file: { field: 'profile', value: image?.file } })} className='flex flex-col w-full gap-2.5 px-4 py-2'>
                {
                    upl_Response &&
                    <p className={`px-4 py-2 ${!upl_Response.success ? 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'}  text-sm`}>

                        {upl_Response.msg}
                    </p>
                }
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
                <div className='flex items-center justify-center'>
                    <div className='relative my-5 '>
                        {
                            image ?
                                <img className='rounded-full h-[120px] w-[120px] object-cover ' src={image.preview} alt="" />
                                :
                                <UserAvatar profile={group?.profile} name={form.groupName} size={120} />
                        }
                        <label htmlFor="imagePicker">
                            <TbColorPicker size={32} color='green' className='absolute border-l-2 border-t-2  cursor-pointer bottom-0 -right-2.5 bg-[var(---color-bg)] rounded-full p-1' />
                        </label>
                        <input id='imagePicker' type="file" accept='.jpg,.png,.jpeg' multiple={false} onChange={handleImageChange} hidden />
                    </div>
                </div>
                <input value={form.groupName} onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                    className="px-2.5 py-1.5  placeholder-[var(---color-placeholder)]  border-[var(---color-input-border)] focus:border-[var(---color-input-b-focus)]  outline-none focus:outline-0 border-2 transition-colors duration-300" type="text" name="groupName" placeholder='Enter Group Name' />
                <textarea value={form.groupDesc} onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })} name="groupDesc" rows={4} placeholder='Enter Group Description'
                    className="px-2.5 py-1.5  placeholder-[var(---color-placeholder)]  border-[var(---color-input-border)] focus:border-[var(---color-input-b-focus)]  outline-none focus:outline-0 border-2 transition-colors duration-300 resize-none">

                </textarea>
                <div>
                    <p className='font-semibold'>Group Privacy</p>
                    <div className='flex gap-4'>
                        <div className='flex gap-2 items-center'>
                            <input onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                                type="radio" name="groupPrivacy" value="public" checked={form.groupPrivacy === 'public'} />
                            Public
                        </div>
                        <div className='flex gap-2 items-center'>
                            <input onChange={(e) => setForm({ type: 'set', field: e.target.name, value: e.target.value })}
                                type="radio" name="groupPrivacy" value="private" checked={form.groupPrivacy === 'private'} />
                            Priavte
                        </div>
                    </div>
                </div>
                <button type="button" className='w-max ml-auto bg-black text-white rounded-lg px-4 py-1.5 font-medium text-xl cursor-pointer'
                    onClick={() => { setForm({ type: 'reset' }) }}>
                    Reset
                </button>
                <button className='bg-black text-white rounded-lg py-2 font-medium text-xl cursor-pointer' type='submit'>
                    {group ? 'Save Changes' : 'Create'}
                </button>
            </form>
        </>
    )
}

export default GroupForm2