import app from './app.js';
import mongoose from 'mongoose';
import 'dotenv/config';

const PORT = 8080;

// start server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connectDB();
});

// DB connection
const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected with Database RAM RAM JEE");
  } catch (err) {
    console.log("Failed to connect with DB", err);
  }
};
