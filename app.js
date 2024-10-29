import express from 'express';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import userRoutes from './src/routes/userRoutes.js';
import verifyRoute from './src/routes/verification.js';
import sequelize from './src/db/sequelize.js';
import logger from './src/Helper/Logger.js';

const app = express();


// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.text());
app.use(express.raw({ type: '*/*' }));


const setResponseHeaders = (res) => {
    res.header({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    });
};

// Database connection function
const connectToDatabase = async () => {
    // const sequelize = new Sequelize({
    //     database: process.env.DB_DATABASE,
    //     username: process.env.DB_USERNAME,
    //     password: process.env.DB_PASSWORD,
    //     host: process.env.DB_HOST,
    //     dialect: "mysql",
    // });
    try {
        await sequelize.authenticate();
        logger.debug({
            severity: 'DEBUG',
            message: 'Database Synchronized.'
          })
        console.log('Database connection has been established successfully.');
        // Sync the database models here if needed
    } catch (error) {
        logger.error({
            severity: 'ERROR',
            message: 'Database Synchronisation error'
          })
        console.error('Unable to connect to the database:', error);
        // Handle error appropriately
    }
};

// Call the database connection function when the application starts
connectToDatabase();

app.all("/healthz", async (req, res) => {
    try {
        if (req.method !== 'GET') {
            // return 405 Method Not Allowed for other req method
            logger.error({
                severity: 'ERROR',
                message: 'No other method allowed other than GET'
              })
            setResponseHeaders(res);
            return res.status(405).send();
        }
        // If the request has payload
        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
            logger.error({
                severity: 'ERROR',
                message: 'No payload allowed for GET'
              })
            setResponseHeaders(res);
            res.status(400).send();
        } else {
            setResponseHeaders(res);
            res.status(200).send();
        }
    } catch (error) {
        logger.error({
            severity: 'ERROR',
            message: 'Error processing Health requests'
          })
        console.error("Error processing health check request:", error);
        setResponseHeaders(res);
        res.status(500).send();
    }
});

// Use userRoutes for handling user-related routes
app.use('/', userRoutes);
app.use('/', verifyRoute);

const port = process.env.SERVER_PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", () => {
    console.log("Server terminated. Interval cleared.");
    server.close(() => {
        process.exit();
    });
});

export default app;
