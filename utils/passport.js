import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

import dotenv from 'dotenv';
dotenv.config()

import User from "../models/User.js";

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;

passport.use(
    new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/google-auth/redirect",
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const sameUser = await User.findOne({ where: { email: profile.emails[0].value } });
                if (sameUser) {
                    done(null, sameUser);
                }
                else {
                    const newUser = { username: profile.displayName, email: profile.emails[0].value };
                    await User.create(newUser);
                    done(null, newUser);
                }
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;