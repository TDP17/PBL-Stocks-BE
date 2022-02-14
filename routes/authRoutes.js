import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const router = express.Router();

/**
 * SUCCESS @returns 200 and adds amount to wallet
 * FAILURE @returns 401/409/500 with error
 */
router.post('/register',
    [
        body('password')
            .isLength({ min: 5, max: 20 }).withMessage("Password must be of 5-20 characters")
            .isAlphanumeric().withMessage("Password must not contain special characters").trim().escape(),
        body('username')
            .isLength({ min: 5, max: 20 }).withMessage("Username must be of 5-20 characters").trim().escape(),
        body('email')
            .isEmail().withMessage("Email is invalid").trim().escape()
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        try {
            const sameUser = await User.findOne({ where: { username: username } });
            if (sameUser) {
                return res.status(409).json({ error: 'User already exists' })
            }
            else {
                if (password !== confirmPassword) {
                    return res.status(400).json({ error: "Password mismatch" })
                }
                const hashedPassword = await bcrypt.hash(password, 12);
                const newUser = { username: username, email: email, password: hashedPassword };
                const saveUser = await User.create(newUser);
                if (saveUser) {
                    return res.status(201).json({ message: "Created" });
                }
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    });

/**
 * SUCCESS @returns JWT with username and email
 * FAILURE @returns 401/500 with error
 */
router.post('/login',
    [
        body('password')
            .trim().escape(),
        body('username')
            .trim().escape()
    ],
    async (req, res, next) => {
        const password = req.body.password;
        try {
            let user;
            if (req.body.username)
                user = await User.findOne({ where: { username: req.body.username } });
            else if (req.body.email)
                user = await User.findOne({ where: { email: req.body.email } });
            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const token = jwt.sign({
                        username: user.username,
                        email: user.email
                    },
                        process.env.JWT_TOKEN,
                        { expiresIn: '24h' }
                    )
                    res.status(200).json({ token: token });
                }
                else {
                    res.status(401).json({ error: "Username or password incorrect" })
                }
            }
            else {
                res.status(401).json({ error: "Username or password incorrect" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error });
        }
    });

export default router;