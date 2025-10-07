import express from 'express';
import CreateChatGroup from '../../controllers/chat/CreateGroup.js';
import CheckAccess from '../../Middlewares/CheckAccess.js';
import VerifyUser from '../../Middlewares/VerifyUser.js';
import getChats from '../../controllers/chat/getChats.js';
import getGroupDetails from '../../controllers/chat/group/getGroupDetails.js';
import UploadProfile from '../../Middlewares/user/UploadProfile.js';
import updateChatGroup from '../../controllers/chat/group/updateGroup.js';
import deleteGroup from '../../controllers/chat/group/deleteGroup.js';
import userlistToInvite from '../../controllers/chat/group/userlistToInvite.js';
import inviteUsers from '../../controllers/chat/group/inviteUsers.js';
import UploadImageMessages from '../../controllers/chat/UploadImageMessages.js';
import saveChatImages from '../../controllers/chat/saveChatImages.js';

const Router = express.Router();

Router.get('/',CheckAccess,VerifyUser,getChats)
Router.get('/invite',CheckAccess,VerifyUser,userlistToInvite)
Router.post('/invite',CheckAccess,VerifyUser,inviteUsers)
Router.post('/images_msg',CheckAccess,VerifyUser,UploadImageMessages,saveChatImages)
Router.get('/group/:room',CheckAccess,VerifyUser,getGroupDetails);
Router.post('/group/new',CheckAccess,VerifyUser,UploadProfile,CreateChatGroup);
Router.post('/group/:room',CheckAccess,VerifyUser,UploadProfile,updateChatGroup);
Router.delete('/group/:room',CheckAccess,VerifyUser,deleteGroup);

export default Router;