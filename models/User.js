import Sequelize from 'sequelize';
import sequelize from "../utils/database.js";

const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    username: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    wallet_amount: {
        type: Sequelize.INTEGER,
        defaultValue: 15000
    }
});

export default User;