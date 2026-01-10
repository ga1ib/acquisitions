import express from 'express';

const router = express.Router();

router.post('/SignUp', (req, res) => {
  // Handle user signup
  res.status(200).send('POST /api/auth/SignUp response');
});
router.post('/SignIn', (req, res) => {
  // Handle user signin
  res.status(200).send('POST /api/auth/SignIn response');
});
router.post('/SignOut', (req, res) => {
  // Handle user signout
  res.status(200).send('POST /api/auth/SignOut response');
});
export default router;