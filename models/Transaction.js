import Sequelize from 'sequelize';
import sequelize from "../utils/database.js";

const Transaction = sequelize.define("transaction", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.INTEGER
    },
    qty: {
        type: Sequelize.INTEGER
    },
    type: {
        type: Sequelize.ENUM("buy", "sell"),
        allowNull: false
    }
}, { createdAt: 'on', updatedAt: false });

export default Transaction;