import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRouter from './routes/user.router.js';

dotenv.config();

const app = express();

console.log("Server is starting...");
// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));  // For static files
app.use(cookieParser());


app.use('/api/v1/users', userRouter);

// Test route to check server is up
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('Test route is working');
});

// Root route for checking server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Listen on a port


export default app;
