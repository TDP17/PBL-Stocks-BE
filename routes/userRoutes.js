import express from 'express';

import isAuth from '../utils/isAuth.js';
import Fund from '../models/Fund.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.get('/getTransactions', isAuth, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.email },
            include: { model: Transaction, attributes: { exclude: ['id', 'user_id'] } }
        });

        const transactions = user.transactions;

        if (transactions)
            res.status(200).json({ transactions: transactions });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.get('/getPortfolio', isAuth, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.email },
            include: { model: Fund }
        });

        // Maps the funds data in proper format to return
        const funds = user.funds.map(fund => { return { name: fund.dataValues.name, qty: fund.dataValues.user_portfolio.dataValues.qty, price: fund.dataValues.price, total: fund.dataValues.user_portfolio.dataValues.qty * fund.dataValues.price } });

        if (funds)
            res.status(200).json({ funds: funds });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

export default router;