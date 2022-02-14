import Sequelize from 'sequelize';
import sequelize from "../utils/database.js";

const User_Portfolio = sequelize.define("user_portfolio", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER
    },
    fund_id: {
        type: Sequelize.INTEGER
    },
    qty: {
        type: Sequelize.INTEGER
    },
    amount: {
        type: Sequelize.INTEGER
    }
});

export default User_Portfolio;