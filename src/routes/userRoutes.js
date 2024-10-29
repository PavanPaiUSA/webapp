import express from 'express';
import {createUser,updateUser,getUser} from '../controllers/userController.js';
import authenticateBasicAuth from '../middleware/authenticationMiddleware.js';

const router = express.Router();
// Create a new user
router.post('/v5/user', createUser);

// Update user information
router.put('/v5/user/self', authenticateBasicAuth, updateUser);

// Get user information
router.get('/v5/user/self', authenticateBasicAuth, getUser);

export default router;