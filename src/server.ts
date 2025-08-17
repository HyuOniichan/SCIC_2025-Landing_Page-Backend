import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import route from './routes';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

const app: Express = express();
const port: string | number = process.env.PORT || '8000';
const db: string = process.env.MONGODB_URI || '';

// Middlewares 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors()); // hardcoded

// Routes 
route(app);

// Connect to database
mongoose.connect(db)
    .then(() => console.log("Connected to database"))
    .catch(() => console.log("Fail to connect"))

// Start server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})
