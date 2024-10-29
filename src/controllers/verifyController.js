import logger from "../Helper/Logger.js";
import { userVerification, setVerification } from "../services/verifyServices.js";

export const verifyUser = async (request, response) => {
    const token = request.query.token;
    logger.debug({
        message: "User verification started",
        severity: 'DEBUG'
      });
    response.set('Cache-Control', 'no-cache');
    try {
        const user = await userVerification(token);
        logger.info({message: ` expiryTime: ${user.expiryTime}`,
        severity: 'INFO'});
        if(user){
            const curDate = Date.now();
            const dbDate = new Date((user.expiryTime).toString()).getTime();
            logger.info({message: `curDate: ${curDate}, expiryTime: ${user.expiryTime}, dbDate: ${dbDate}`,
            severity: 'INFO'});

            if(curDate <= dbDate){
                await setVerification(user.email);
                logger.info({
                    message: "User verification successful",
                    severity: 'INFO'
                  });
                return response.status(200).send();
            } else {
                return response.status(403).send({message:"Verification failed link has expired"});
            }  
        }
        else {
            return response.status(400).send({message:"Verification failed broken link"});
        }
      
        
    } catch (err) {
        logger.error({
            message: `Verification Failed : ${err}`,
            severity: 'ERROR'
          });
          return response.status(503).send({message:"Failed due to error"});
    }
}