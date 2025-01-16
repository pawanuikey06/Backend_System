import app from './app.js'; 
import dotenv from 'dotenv';
import connectDB from './db/index.js';

// Load environment variables from .env file
dotenv.config({
    path: './env'  // Ensure that your .env file is located in the 'env' folder or adjust the path
});

connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");

        // Start the server
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 5000}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed!!!", error);
    });

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});



// FIRST APPROACH
/*import express from "express"
const app =express()
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}
            /${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listning on Port ${process.env.PORT}`)
        })

    }catch(error){
        console.error("Error",error);
        throw error;

    }

}
)()*/