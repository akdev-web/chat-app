import express from 'express';
import CheckAccess from '../../Middlewares/CheckAccess.js';
import VerifyUser from '../../Middlewares/VerifyUser.js';
import getUserQuiz from '../../controllers/dashboard/getUserQuiz.js';

const Router = express.Router();

Router.get('/quiz',CheckAccess,VerifyUser,getUserQuiz)

export default Router;