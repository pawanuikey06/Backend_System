// require('dotenv').config({path:'./env'})
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})


connectDB().then(()=>{
    console.log("MONGO DB CONNECTED SUCCESFULLY");
    
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is Running at PORt  :"+process.env.PORT)
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!!",error)
});

// GLOBAL ERROS HANDLE FOR APP
app.on('error',()=>{
    console.log("ERROR: ",error);
})
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