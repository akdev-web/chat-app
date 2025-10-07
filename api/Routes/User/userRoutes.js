import express from 'express';
import Profile from '../../controllers/user/Profile.js';
import CheckAccess from '../../Middlewares/CheckAccess.js';
import VerifyUser from '../../Middlewares/VerifyUser.js';
import Knowns from '../../controllers/user/Knowns.js';
import UpdateProfile from '../../controllers/user/UpdateProfile.js';
import UploadProfile from '../../Middlewares/user/UploadProfile.js';

const Router = express.Router() 

Router.get('/profile',CheckAccess,Profile);
Router.get('/knowns',CheckAccess,VerifyUser,Knowns);
Router.post('/profile',CheckAccess,VerifyUser,UploadProfile,UpdateProfile);

export default Router;