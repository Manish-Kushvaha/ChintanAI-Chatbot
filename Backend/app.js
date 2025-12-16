import express from 'express';
import cors from 'cors';
import session from 'express-session';
import flash from 'connect-flash';
import chatRoutes from './routes/chat.js';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/user.js';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js'

const app = express();
app.set("trust proxy", 1);

// Session config
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,          // REQUIRED for HTTPS
    sameSite: "none",      // REQUIRED for cross-domain
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
};

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(session(sessionOptions));
app.use(flash());
// app.use("/auth", authRoutes);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/api/auth', authRoutes);
app.use('/api',chatRoutes);

export default app;