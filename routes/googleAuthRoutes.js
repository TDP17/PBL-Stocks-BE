import express from 'express';
import passport from 'passport';

const CLIENT_URL = 'http://localhost:3000';

const router = express.Router();

router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/redirect", passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/failed",
}));

router.get("/success", (req, res) => {
    if (req.user)
        res.status(200).json({ username: req.user.username, email: req.user.email });
    else res.status(401).json({ error: "Unauthorized" });
});

router.get("/failed", (req, res) => {
    res.status(401).json({ error: "Authentication failed" });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.status(200).json({ message: "Logged out" });
});


export default router;