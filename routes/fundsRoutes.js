import express from 'express';

import isAuthorized from '../utils/isAuthorized.js';
import Fund from '../models/Fund.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import User_Portfolio from '../models/User_Portfolio.js';

const router = express.Router();

router.get('/getAll', isAuthorized, async (req, res) => {
    try {
        const funds = await Fund.findAll({});
        res.status(200).json({ funds: funds });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/buy', isAuthorized, async (req, res) => {
    const fundId = req.body.id;
    const fundQty = req.body.qty;
    try {
        const fund = await Fund.findByPk(fundId);

        const user = await User.findOne({ where: { email: req.email } });
        if (user && fund) {
            const totalPrice = fund.price * fundQty;
            if (user.wallet_amount >= totalPrice) {
                const newAmount = user.wallet_amount - totalPrice;
                user.wallet_amount = newAmount;
                await user.save();

                await Transaction.create({ user_id: user.id, name: fund.name, price: fund.price, qty: fundQty, type: "buy" });

                const prevRecord = await User_Portfolio.findOne({ where: { user_id: user.id, fund_id: fund.id } });
                if (prevRecord) {
                    const newQty = prevRecord.qty + fundQty;
                    prevRecord.qty = newQty;
                    prevRecord.save();
                }
                else
                    await User_Portfolio.create({ user_id: user.id, fund_id: fund.id, qty: fundQty });

                res.status(200).json({ message: "Transaction successful" });
            }
            else res.status(402).json({ error: "Insufficient Funds" });
        }
        else res.status(401).json({ error: "Oops" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }

});

export default router;