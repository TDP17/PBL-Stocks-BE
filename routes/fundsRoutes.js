import express from 'express';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import dotenv from 'dotenv';
import path from 'path';

import isAuth from '../utils/isAuth.js';
import Fund from '../models/Fund.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import User_Portfolio from '../models/User_Portfolio.js';

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    }
});

/**
 * Gets all funds available
 */
router.get('/getAll', isAuth, async (req, res) => {
    try {
        const funds = await Fund.findAll({});
        res.status(200).json({ funds: funds });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})



/**
 * This route receives the id of the fund and the qty to be purchased. 
 * The username and email are attached to the req object via isAuth middleware.
 * It verifies if the user and fund exist and also if the user has sufficient coins to buy the fund.
 * SUCCESS @returns 200 and manages the entry on the transaction and portfolio tables
 * FAILURE @returns 402 - Insufficient Coins, 401 - User/Fund not found, 500
 */
router.post('/buy', isAuth, async (req, res) => {
    const fundId = +req.body.id;
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
                else await User_Portfolio.create({ user_id: user.id, fund_id: fund.id, qty: fundQty })

                const handlebarOptions = {
                    viewEngine: {
                        partialsDir: path.resolve('./emailTemplates/'),
                        defaultLayout: false,
                    },
                    viewPath: path.resolve('./emailTemplates/'),
                };

                transporter.use('compile', hbs(handlebarOptions))

                const mailOptions = {
                    from: process.env.MAIL_USERNAME,
                    to: user.email,
                    subject: 'Transaction Successful',
                    template: 'buy',
                    context: {
                        name: user.username,
                        fundName: fund.name,
                        date: Date.now()
                    }
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.status(200).json({ message: "Transaction successful" });
            }
            else res.status(402).json({ error: "Insufficient Coins" });
        }
        else res.status(401).json({ error: "Oops" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

/**
 * This route receives the id of the fund and the qty to be purchased. 
 * The username and email are attached to the req object via isAuth middleware.
 * It verifies if the user and fund exist and also if the user has the sufficient qty to sell
 * SUCCESS @returns 200 and manages the entry on the transaction and portfolio tables
 * FAILURE @returns 402 - Insufficient Coins, 401 - User/Fund not found, 500
 */
router.post('/sell', isAuth, async (req, res) => {
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

                transporter.use('compile', hbs(handlebarOptions))

                const mailOptions = {
                    from: process.env.MAIL_USERNAME,
                    to: user.email,
                    subject: 'Transaction Successful',
                    template: 'sell',
                    context: {
                        name: user.username,
                        fundName: fund.name,
                        date: Date.now()
                    }
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

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