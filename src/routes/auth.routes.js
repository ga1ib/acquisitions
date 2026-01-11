import express from 'express';
import { signup, signin, signout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/SignUp', signup);
router.post('/SignIn', signin);
router.post('/SignOut', signout);

export default router;
