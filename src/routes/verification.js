import express from 'express';
import * as verify from "../controllers/verifyController.js"

const router = express.Router();
router.route('/verify').all(verify.verifyUser);

export default router;