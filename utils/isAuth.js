import jwt from 'jsonwebtoken';

/**
 * @param {*} req The request object
 * @param {*} res The result object
 * @param {*} next Used to move on to the next middleware
 * Unauthorized @returns 401, error
 * Authorized calls next middleware via next()
 */
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.username = req.user.username;
        req.email = req.user.email;
        next();
        return;
    }
    const authHeader = req.get('Authorization');
    let decodedToken;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    else {
        const token = req.get('Authorization').split(' ')[1];
        try {
            decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        } catch (error) {
            return res.status(401).json({ error: "Token expired or malformed" });
        }
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.username = decodedToken.username;
        req.email = decodedToken.email;
        next();
    }
};

export default isAuth;