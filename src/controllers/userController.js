import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import sequelize from '../db/sequelize.js';
import logger from '../Helper/Logger.js';
import authenticateBasicAuth from '../middleware/authenticationMiddleware.js';
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();

const topicName = 'projects/dev-packer-project/topics/verify-email';

// Create a new user
 export const createUser = async (req, res) => {
  try {
    const { username, password, first_name, last_name } = req.body;

    if(Object.keys(req.query).length != 0) {
      logger.error({
        severity: 'ERROR',
        message: 'createUser: Invalid Request with Query Parameters'
      });
      return res.status(400).send({message: "Invalid Request with Query Parameters"});
    }

    if(Object.keys(req.body).length == 0) {
      logger.error({
        severity: 'ERROR',
        message: 'createUser: Invalid Request with No Payload'
      });
      return res.status(400).send({message: "Invalid Request with No Payload"});
    }

    // Check if a user with the same email already exists
    console.log("Email: ", username);
    await sequelize.sync();
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.error({
        severity: 'ERROR',
        message: 'createUserService: User Already exists'
      });
      return res.status(400).send({message: "The user already exists"}); //If same user exists then send 400 status code
    }else{
      logger.info({
          severity: 'INFO',
          message: 'createUserService: Creating a new User'
        });

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    // Create a new user
    const user = await User.create({
      username,
      password: hashedPassword,
      first_name,
      last_name,
      account_created: new Date().getTime(),
      account_updated: new Date().getTime(),
    });
    if (process.env.APP_ENV == 'test'){
      user.is_verified =true;
      user.save();
    }

    const newUser = user.toJSON();
    if ('password' in newUser) {
      delete newUser.password; // Remove password from the response for security
    }
    if ('is_verified' in newUser) {
      delete newUser.is_verified;
    }

    logger.info({
      severity: 'INFO',
      message: 'createUser: New user created successfully'
    });

    if (process.env.APP_ENV == 'prod') {
      let data = {
        username: newUser.username
      }
      const sendData = JSON.stringify(data);
      const dataBuffer = Buffer.from(sendData);
      try {
        const messageId = await pubsub
          .topic(topicName)
          .publishMessage({ data: dataBuffer });
        logger.info({
          message: `Message published: ${messageId}`,
          severity: 'INFO'
        })
      }catch (error) {
        logger.error({
          message: `Error occured while publishing message : ${error.message}`,
          severity: 'ERROR'
        });
      }
    }

    return res.status(201).json(newUser);
  } }catch (error) {
    logger.debug({
      severity: 'DEBUG',
      message: 'createUser: Failed due to error - ${error.message}'
    });
    return res.status(400).send({ message: "Failed due to error" });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;
    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    
    const [username, password1] = credentials.split(':');
    if(credentials == null || username == null || password1 == null){
      logger.error({
          severity: 'ERROR',
          message: 'getUser: Authentication Credentials Missing'
        });
        return res.status(400).send();
      }
    if(Object.keys(req.query).length != 0) {
      logger.error({
        severity: 'ERROR',
        message: 'createUser: Invalid Request with Query Parameters'
      });
      return res.status(400).send({message: "Invalid Request with Query Parameters"});
    }

    if(Object.keys(req.body).length == 0) {
      logger.error({
        severity: 'ERROR',
        message: 'createUser: Invalid Request with No Payload'
      });
      return res.status(400).send({message: "Invalid Request with No Payload"});
    }

    //const userId = req.user.username; // Fetch the user id from findOne function in authenticationMiddleware

    // Find the user by ID
    const user = await User.findOne({
      where: { username: username },
    });

    if (!user) {
      logger.error({
        severity: 'ERROR',
        message: 'updateUser: Username cannot be updated as the user does not exist.'
      });
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.is_verified) {
      logger.error({
        severity: 'ERROR',
        message: 'updateUser: Username cannot be updated as the user does not exist.'
      });
      return res.status(403).json({ message: 'User not verified' });
    
    }

    // Update allowed fields
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user.password = hashedPassword;
    }

    // Check for any additional fields in the request body
    const additionalFields = Object.keys(req.body).filter(
      (field) => !['first_name', 'last_name', 'password'].includes(field)
    );

    if (additionalFields.length > 0) {
      logger.error({
        severity: 'ERROR',
        message: 'updateUser: Attempt to update unauthorized field'
      });
      return res.status(400).send("Attempt to update unauthorized field");
    }
    user.account_updated = new Date();
    await user.save();
    logger.info({
      severity: 'INFO',
      message: 'updateUser: User updated successfully.'
    });
    res.status(204).send({ message: "User Updated Successfully" });
  } catch (error) {
    logger.debug({
      severity: 'DEBUG',
      message: 'createUser: Failed due to error - ${error.message}'
    });
    return res.status(400).send({ message: "Failed due to error" });
  }
};

// Get user information
export const getUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password1] = credentials.split(':');
    if(credentials == null || username == null || password1 == null){
      logger.error({
          severity: 'ERROR',
          message: 'getUser: Authentication Credentials Missing'
        });
        return res.status(400).send();
      }
  
  
    //const userId = req.user.username; // Fetch the user id from findOne function in authenticationMiddleware

    // Find the user by ID
    const user = await User.findOne({
      where: { username: username },
    });
    if(Object.keys(req.query).length != 0 || Object.keys(req.body).length != 0 ){
      logger.error({
          severity: 'ERROR',
          message: 'getUser: Invalid Request with Query Parameters'
        });
        return res.status(400).send({message: "Invalid Request with Query Parameters"});
      }
    else if (user == null) {
      logger.error({
        severity: 'ERROR',
        message: 'getUserService: User Not Found'
      });
      return res.status(400).send({message: "User Not Found"});
    }
    else{
    // Remove password from the response
    const createdUser = user.toJSON();
    if(!createdUser.is_verified){
      logger.error({
        severity: 'ERROR',
        message: 'getUserService: User Not Verified'
      });
      return res.status(403).send({message: "User Not Verified"});
    }
    else{
      logger.info({
        severity: 'INFO',
        message: `getService: ${createdUser.is_verified}`
      });
    }
    if('password' in createdUser){
      delete createdUser.password;
  }
  if ('is_verified' in createdUser) {
    delete createdUser.is_verified;
  }
  logger.info({
    severity: 'INFO',
    message: 'getUser: The User retrived successfully'
  });
    
    res.status(200).json(createdUser);
  }
  } catch (error) {
    logger.debug({
      severity: 'DEBUG',
      message: 'getUser: Failed due to error - ${error.message}'
    });
    return res.status(400).send({ message: "Failed due to error" });
  }
};

export default {
  createUser,
  updateUser,
  getUser
};