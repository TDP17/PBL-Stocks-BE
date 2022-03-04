import express from 'express';

import isAuthorized from '../utils/isAuthorized.js';
import Fund from '../models/Fund.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.get('/getAll', isAuthorized, async (req, res) => {
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

export default router;