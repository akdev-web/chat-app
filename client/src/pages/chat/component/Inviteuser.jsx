import { useState } from "react";
import { useEffect } from "react";
import UserAvatar from "../../../components/util/UserAvatar";
import { chat } from "../../../components/api";
import ToastMsg from "../../../components/util/AlertToast";

const InviteUsers = ({ group }) => {
    const [users, setUsers] = useState(null)
    const [selected, setselected] = useState([]);
    const [state, setState] = useState({loading:false,fetching:true});
    useEffect(() => {
        //get users who are not in this room
        const getUsers = async () => {
            setState(prev=>({...prev,fetching:true}));
            try {
                const res = await chat.get('/invite', { params: { group: group.room } });
                if (res.data.success) {
                    const data = res.data;
                    setUsers(data.users);
                    setState(prev=>({...prev,fetching:false}));
                }
            } catch (error) {
                    setState(prev=>({...prev,fetching:false}));
                console.log(error);
            }
        }
        getUsers();
    }, [])

    console.log(selected);

    const inviteUsers = async() => {
        setState(prev=>({...prev,loading:true}));
        try {
            const res = await chat.post('/invite',{users:selected,room:group.room});
            if (res.data.success) {
                const data = res.data;
                ToastMsg({msg:data.msg,type:'success'})
                setState(prev=>({...prev,loading:false}));
            }
        } catch (error) {
            setState(prev=>({...prev,loading:false}));
            console.log(error);
        }
    }
    if (state.fetching) {
        return (
            <div className="text-center text-lg" >
                <p>wait fetching users list ...</p>
            </div>
        )
    }
    return (
        <div className=" overflow-y-auto relative h-full">
            <div className="">
                {users.map((user) => (
                    <div
                        key={user.userId}
                        className={`flex gap-2.5 p-3 cursor-pointer hover:bg-blue-100 ${selected.includes(user.userId) ? 'bg-blue-200' : ''
                            }`}
                        onClick={() => {
                            if (selected.includes(user.userId)) {
                                return setselected(prev => prev.filter(p => p !== user.userId))
                            }
                            setselected(prev => [...prev, user.userId])
                        }}
                    >
                        <UserAvatar size={28} name={user.name} profile={user.profile} />
                        <p className="font-medium">{user.name}</p>
                    </div>
                ))}
            </div>
            <button onClick={inviteUsers} 
                className='absolute bottom-10 ml-[25%] w-[50%]  bg-black text-white rounded-lg py-2 font-medium text-xl cursor-pointer' type='submit'>
                    Invite
            </button>
        </div>
    );
};

export default InviteUsers;