import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import logger from '../Helper/Logger.js';

async function authenticateBasicAuth(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    logger.error({
      severity: 'DEBUG',
      message: 'Auth Middleware: user credentials is invalid'
    });
    return res.status(401).json({ message: 'Authentication header missing or invalid' });
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  
  const [username, password] = credentials.split(':');

  try {
    // Check if a user with the provided email exists
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      logger.error({
        severity: 'ERROR',
        message: 'Auth Middleware: Invalid Email'
      });
      return res.status(401).json({ message: 'Invalid email' });
    }

    // Compare the provided password with the stored hashed password
    if (!bcrypt.compareSync(password, user.password)) {
      logger.error({
        severity: 'ERROR',
        message: 'Auth Middleware: Invalid Password'
      });
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create a JWT token for the user
    // const token = jwt.sign(
    //   { id: user.id, username: user.username },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' } // Set the expiration time
    // );

    // // Attach the token to the request for future use
    // req.token = token;
    // req.user = user;
    // console.log("check");
    next();
  } catch (error) {
    logger.debug({
      severity: 'DEBUG',
      message: 'Auth Middleware: Failed due to error - ${error.message}'
    });
    res.status(500).json({ message: 'Auth Middleware Error' });
  }
}

export default authenticateBasicAuth;
