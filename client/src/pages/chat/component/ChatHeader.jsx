// components/ChatHeader.jsx
import { ArrowLeft, MoreVertical, Phone } from "lucide-react"; // Or use any icon
import { useState } from "react";
import UserAvatar from "../../../components/util/UserAvatar";

const ChatHeader = ({ activeCont, setActiveCont, chat, onBack, deleteChat, isMobileView }) => {
  const [showMenu, setShowMenu] = useState(false);



  if (!chat || activeCont !== 'chat') {

    return (
      <div className="bg-[var(--nav-head)] text-[var(--nav-text)] px-4 py-3 flex items-center gap-2 rounded-t-md">
        {(isMobileView || activeCont!=='chat' ) && (
          <button onClick={onBack} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold truncate">
            {
              activeCont === 'form' ?
                'Enter Group Details' :
                activeCont === 'userlist' ?
                  'Select a user to Chat'
                  :
                  activeCont === 'groupDetail' ?
                    `Viewing Group ${chat.groupName}`
                    :
                    'Select a Chat'
            }
          </h2>
        </div>
      </div>
    );
  }



  return (
    <div className="relative bg-[var(--nav-head)] text-[var(--nav-text)] px-4 py-3 flex items-center gap-2 rounded-t-md">
      {/* Back Button */}
      {isMobileView && (
        <button onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Chat Info */}
      {chat.isPersonal ? (
        <div className="flex gap-2.5 items-center flex-grow">
          <UserAvatar profile={chat.user.profile} name={chat.user.name} size={32} className="cursor-pointer" />
          <div className="flex flex-col ">
            <h2 className="text-lg font-semibold truncate">
              Chatting with {chat.user.name}
            </h2>
            <p className="text-sm">{chat.online ? "online" : "offline"}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5 items-center flex-grow">
          <div onClick={() => setActiveCont('groupDetail')}>
            <UserAvatar profile={chat.groupProfile} name={chat.groupName} size={32} className="cursor-pointer" />
          </div>
          <div className="flex flex-col flex-grow">
            <h2 className="text-lg font-semibold truncate">
              Chatting in {chat.groupName}
            </h2>
            <p className="text-sm">{chat.groupDesc}</p>
          </div>
        </div>
      )}

      {/* Voice Call Button */}
      {chat.isPersonal &&
        <button className="p-2 rounded-full hover:bg-[var(--nav-hover)] transition">
          <Phone className="w-5 h-5" />
        </button>}

      {/* More Options Menu */}
      {chat.isAdmin &&
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-[var(--nav-hover)] transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-[var(--nav-head)] text-[var(--nav-text)] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {
                !chat.isOwner ?
                <ul className="py-1">
                  <li className="px-4 py-2 hover:bg-[var(--nav-hover)] cursor-pointer">Block</li>
                  <li className="px-4 py-2 hover:bg-[var(--nav-hover)] cursor-pointer">Report</li>
                  <li className="px-4 py-2 hover:bg-[var(--nav-hover)] cursor-pointer">Leave</li>
                </ul>
                :
                <ul className="py-1">
                  <li onClick={()=>deleteChat(chat.room)} className="px-4 py-2 hover:bg-[var(--nav-hover)] cursor-pointer" >Delete</li>
                </ul>    
              }
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default ChatHeader;
