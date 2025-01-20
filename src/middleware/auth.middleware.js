import asyncHandler from "../utils/asyncHandler.js"
import APiError from "../utils/APiError.js"
import jwt from 'jsonwebtoken'
import {User} from "../models/user.model.js"


// res is _ beacuse we are not sending any response here ||optional;
export const verifyJWT =asyncHandler(async(req,_,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer","")
 
     if(!token){
         throw new APiError(401,"Unauthorized Request")
     }
 
     const decodedToken= jwt.verify(token,process.env
         .ACCESS_TOKEN_SECRET)
 
     const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
     
     
     if(!user){
         throw new APiError(401,"Invalid Access Token");
     }
 
     req.user=user;
     next()
   } catch (error) {
      
    throw new APiError(401,error?.message || "Invalid Access Token");
    
   }
   
})