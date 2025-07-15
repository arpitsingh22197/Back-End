import {app} from './app.js';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
dotenv.config(
    {
        path: './.env'
    }
);

const port =  process.env.PORT  || 8001 ;
connectDB()
.then(
    () => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
)
.catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process with failure
});


