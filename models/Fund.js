import Sequelize from 'sequelize';
import sequelize from "../utils/database.js";

const Fund = sequelize.define("fund", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type:Sequelize.STRING
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, { timestamps: false });

export default Fund;