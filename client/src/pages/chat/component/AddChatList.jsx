import UserAvatar from "../../../components/util/UserAvatar";

const AddChatList = ({ users, onSelect, selectedUser,setActiveCont }) => {
  return (
      <div className="">
        {users.map((user) => (
          <div
            key={user.userId}
            className={`p-3 flex gap-2.5 items-center cursor-pointer hover:bg-blue-100 ${
              selectedUser?.userId === user.userId ? 'bg-blue-200' : ''
            }`}
            onClick={() => {onSelect(user); setActiveCont('chat')}}
          >
            <UserAvatar name={user.username} profile={user.profile} size={48} />
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm">{user.online ? "Online" : "Offline"}</p>
            </div>
          </div>
        ))}
      </div>
  );
};

export default AddChatList;
