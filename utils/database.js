import Sequelize from 'sequelize';

import dotenv from 'dotenv';
dotenv.config();
/**
 * @todo set login to false in production
 * @todo dialectOptions should be uncommented when using heroku psql
 */
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false
    //     }
    // }, 
    logging: console.log
});

export default sequelize;