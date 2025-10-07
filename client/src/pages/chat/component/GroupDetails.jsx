import React from 'react'
import { useEffect } from 'react';
import { chat } from '../../../components/api';
import { useState } from 'react';
import UserAvatar from '../../../components/util/UserAvatar';
import GroupForm from './GroupForm';
import GroupForm2 from './GroupFormV2';
import { UserRoundPlus } from 'lucide-react';

const GroupDetails = ({group,setActiveCont}) => {
    console.log(setActiveCont);
    const [groupDetails,setGroupDetails] = useState(group);
    const {profile,groupName,groupDesc,members,room} = groupDetails;
    console.log(groupDetails);

    const [loading,setLoading] = useState(true);
    const [response,setResponse] = useState(null);
    const [editGroup,setEditGroup] = useState(false);
    useEffect(()=>{
        const getGroupDetails =async()=>{
            setLoading(true);
            try {
                const res = await chat.get(`/group/${room}`);
                if(res.data.success){
                    let data = res.data;
                    setGroupDetails(data.groupDetails);
                    setLoading(false)
                }
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        }
        getGroupDetails();
    },[group]);

    const handleUpdateGroup = (e)=>{
        e.preventDefault();
    }

    if(loading)
    return(
    <div>
        <div className='mt-4 px-3 flex flex-col items-center gap-4'onSubmit={handleUpdateGroup}>
            <UserAvatar name={groupName} size={120} profile={profile}/>
            <div className='w-full'>
                <p className='text-sm text-[var(---color-text-xlight)]'>Group Name : </p>
                <p>{groupName}</p>
                <p className='mt-4 text-sm text-[var(---color-text-xlight)]'>Group Description : </p>
                <p>{groupDesc}</p>
            </div>
            {groupDetails.isAdmin }
        </div>
        <p className='text-lg text-center mt-4'> Wait details are fetching .....</p>
    </div>)

  return (
    <div>
        {
            editGroup ?
            <GroupForm2 group={groupDetails} /> :
        
            <div className='mt-4 px-3 flex flex-col items-center gap-4'onSubmit={handleUpdateGroup}>
                <UserAvatar name={groupName} size={120} profile={profile}/>
                <div className='w-full'>
                    <p className='text-sm text-[var(---color-text-xlight)]'>Group Name : </p>
                    <p>{groupName}</p>
                    <p className='mt-4 text-sm text-[var(---color-text-xlight)]'>Group Description : </p>
                    <p>{groupDesc}</p>
                </div>
                {groupDetails.isOwner && 
                    <button onClick={()=>setEditGroup(true)} className='min-w-[50%] text-[var(--nav-text)] p-2 rounded-md cursor-pointer font-semibold bg-black hover:bg-gray-800'>
                        Edit Group Details
                    </button>
                }
            </div>
        }
        <div className='my-4 p-2 text-xl flex justify-between items-center bg-[var(--nav-head)] text-[var(--nav-text)]'>
            <div className='flex gap-2.5'>
                <h2 className=' font-medium text-center  '>Group Members</h2>
                <p>({members.length})</p>
            </div>
            <div className='cursor-pointer' onClick={()=>setActiveCont('invite')}>
                <UserRoundPlus size={28}/>
            </div>
        </div>
        {
            members.map((m,i)=>{
                console.log(m);
                return <div key={i} className='flex  justify-between px-2 items-center'>
                    <div className='flex items-center justify-start gap-2.5'>
                        <UserAvatar name={m.name} profile={m.profile}  />
                        <p>{m.name}</p>
                    </div>
                    <p>{m.isAdmin && '(Admin)'}</p>
                </div>
            })
        }
    </div>
  )
}

export default GroupDetails