import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(cookieParser());

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || '*',    
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));
 

app.use(express.json({
    limit: '16kb'
}));
app.use(express.urlencoded({ extended: true ,limit: '16kb'}));

app.use(express.static('public'));


// routes
import healthCheckRouter from './routes/healthcheck.routes.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middlewares/error.middlewares.js';



app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);

app.use(errorHandler);

export {app}