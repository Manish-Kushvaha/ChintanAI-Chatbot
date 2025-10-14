import express from 'express';
import passport from 'passport';
import User from '../models/user.js';

const router = express.Router();

// REGISTER 
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({ username, email });

        // hashing and salt
        await User.register(user, password);

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// LOGIN 
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        // Log the user in
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({ message: "Logged in successfully", user: { username: user.username, email: user.email } });
        });
    })(req, res, next);
});

//  CHECK AUTH STATUS 
router.get("/check", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) { 
        res.json({ loggedIn: true, user: { username: req.user.username, email: req.user.email } });
    } else {
        res.json({ loggedIn: false });
    }
});

// LOGOUT 
router.post("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        res.json({ message: "Logged out successfully" });
    });
});

export default router;
