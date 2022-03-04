import express from 'express';
import cors from 'cors';

import sequelize from './utils/database.js';

import User from './models/User.js';
import Fund from './models/Fund.js';
import Transaction from './models/Transaction.js';
import User_Portfolio from './models/User_Portfolio.js';

import authRoutes from './routes/authRoutes.js';
import fundsRoutes from './routes/fundsRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));

const port = process.env.PORT || 5000;

app.use('/auth', authRoutes);
app.use('/funds', fundsRoutes);
app.use('/transactions', transactionRoutes);

app.get("/", (req, res) => {
    res.send("Hello pbl");
});

/**
 * Relations @see https://sequelize.org/master/manual/assocs.html
 * 1 User - M Transaction
 */
User.hasMany(Transaction, {
    foreignKey: 'user_id',
    onDelete: 'NO ACTION'
});
Transaction.belongsTo(User, {
    foreignKey: 'user_id',
});

// N User - M Transaction
User.belongsToMany(Fund, { through: User_Portfolio, foreignKey: 'user_id', otherKey: 'fund_id' });
Fund.belongsToMany(User, { through: User_Portfolio, foreignKey: 'fund_id', otherKey: 'user_id' });

sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log("App running on port", port);
        });
    })
    .catch(err => console.log(err));
