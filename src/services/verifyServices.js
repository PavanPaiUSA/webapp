import { User } from '../models/user.js';
import EmailTracking from '../models/EmailTracking.js';
import logger from '../Helper/Logger.js';

export const userVerification = async (token) => {
    const user = await EmailTracking.findOne({ where: { token: token } });
    logger.info({
        message: `email: ${user.email}, token: ${user.token} , expiryTime : ${user.expiryTime}`,
        severity: 'INFO'
    });
    return user;
}

export const setVerification = async (email) => {
    const user = await User.findOne({ where: { username: email} });
    try{
        user.is_verified = true;
    }catch(err){
        logger.error({
            message: `Error while setting the verification flag : ${err}`,
            severity: 'ERROR'
        });
    }
    await user.save();
    return user;
}