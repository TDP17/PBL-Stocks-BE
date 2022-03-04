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

try {
    await sequelize.query(
        'CREATE OR REPLACE FUNCTION delete_zeroQty_funds() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN DELETE FROM User_Portfolios WHERE qty=0 OR qty IS NULL; RETURN NULL; END; $function$'
    );
    await sequelize.query(
        'CREATE OR REPLACE TRIGGER delete_zeroQty_funds AFTER UPDATE ON User_Portfolios FOR EACH ROW EXECUTE PROCEDURE delete_zeroQty_funds();'
    );
    // await sequelize.query(
    //     'CREATE OR REPLACE FUNCTION fill_amount() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN SET User_Portfolios.amount = 1; RETURN NULL; END; $function$'
    // );
    // await sequelize.query(
    //     'CREATE OR REPLACE TRIGGER fill_amount BEFORE INSERT ON User_Portfolios FOR EACH ROW EXECUTE PROCEDURE fill_amount();'
    // );
} catch (error) {
    console.log(error);
}
export default sequelize;