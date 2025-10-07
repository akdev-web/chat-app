import exprss from 'express';
import serveChatImages from '../../controllers/cloud/serverChatImages.js';

const Router = exprss.Router()

Router.get('/chatImage',serveChatImages);

export default Router;