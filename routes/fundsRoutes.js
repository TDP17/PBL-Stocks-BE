import express from 'express';

import isAuthorized from '../utils/isAuthorized.js';
import Fund from '../models/Fund.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import User_Portfolio from '../models/User_Portfolio.js';

const router = express.Router();

/**
 * Gets all funds available
 */
router.get('/getAll', isAuthorized, async (req, res) => {
    try {
        const funds = await Fund.findAll({});
        res.status(200).json({ funds: funds });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

/**
 * This route receives the id of the fund and the qty to be purchased. 
 * The username and email are attached to the req object via isAuthorized middleware.
 * It verifies if the user and fund exist and also if the user has sufficient coins to buy the fund.
 * SUCCESS @returns 200 and manages the entry on the transaction and portfolio tables
 * FAILURE @returns 402 - Insufficient Coins, 401 - User/Fund not found, 500
 */
router.post('/buy', isAuthorized, async (req, res) => {
    const fundId = req.body.id;
    const fundQty = +req.body.qty;
    if (fundQty <= 0)
        return res.status(400).json({ error: "Quantity cannot be zero or a negative number" });
    try {
        const fund = await Fund.findByPk(fundId);

        const user = await User.findOne({ where: { email: req.email } });
        if (user && fund) {
            const totalPrice = fund.price * fundQty;
            if (user.wallet_amount >= totalPrice) {
                const newAmount = user.wallet_amount - totalPrice;
                user.wallet_amount = newAmount;
                await user.save();

                await user.createTransaction({ user_id: user.id, name: fund.name, price: fund.price, qty: fundQty, type: "buy" });

                const prevRecord = await User_Portfolio.findOne({ where: { user_id: user.id, fund_id: fund.id } });
                if (prevRecord) {
                    const newQty = prevRecord.qty + fundQty;
                    prevRecord.qty = newQty;
                    prevRecord.save();
                }
                else await user.addFund({ fund_id: fund.id, qty: fundQty });


                res.status(200).json({ message: "Transaction successful" });
            }
            else res.status(402).json({ error: "Insufficient Coins" });
        }
        else res.status(401).json({ error: "Oops" });

    } catch (error) {
        res.status(500).json({ error: error });
    }
});

/**
 * This route receives the id of the fund and the qty to be purchased. 
 * The username and email are attached to the req object via isAuthorized middleware.
 * It verifies if the user and fund exist and also if the user has the sufficient qty to sell
 * SUCCESS @returns 200 and manages the entry on the transaction and portfolio tables
 * FAILURE @returns 402 - Insufficient Coins, 401 - User/Fund not found, 500
 */
router.post('/sell', isAuthorized, async (req, res) => {
    const fundId = req.body.id;
    const fundQty = +req.body.qty;
    if (fundQty <= 0)
        return res.status(400).json({ error: "Quantity cannot be zero or a negative number" });
    try {
        const user = await User.findOne({ where: { email: req.email } });
        const fund = await Fund.findOne({ where: { id: fundId } });
        const portfolioEntry = await User_Portfolio.findOne({ where: { user_id: user.id, fund_id: fundId } });

        if (user && fund) {
            const totalPrice = fund.price * fundQty;

            if (portfolioEntry && portfolioEntry.qty >= fundQty) {
                const newAmount = user.wallet_amount + totalPrice;
                user.wallet_amount = newAmount;
                await user.save();

                await user.createTransaction({ name: fund.name, price: fund.price, qty: fundQty, type: "sell" });

                const newQty = portfolioEntry.qty - fundQty;
                portfolioEntry.qty = newQty;
                portfolioEntry.save();

                res.status(200).json({ message: "Transaction successful" });
            }
            else res.status(402).json({ error: "You dont have the given quantity of the fund in your account" });
        }
        else res.status(401).json({ error: "Oops" });

    } catch (error) {
        res.status(500).json({ error: error });
    }

});

export default router;