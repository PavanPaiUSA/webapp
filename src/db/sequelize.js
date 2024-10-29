import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Sequelize from 'sequelize';


// const __filename = fileURLToPath(import.meta.url);
// // const _dirname = dirname(_filename);
dotenv.config({
//   override: true,
//   path: path.join(__dirname,'../.env')
});

console.log(process.env.DB_DATABASE);


const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    // database: process.env.DB_DATABASE,
    // username: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

export default sequelize;