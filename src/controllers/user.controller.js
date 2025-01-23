import asyncHandler from '../utils/asyncHandler.js';  // Ensure asyncHandler is correct
import APiError from "../utils/APiError.js";
import ApiResponse from '../utils/ApiResponse.js';
import validator from 'validator';
import { User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens =async(userId)=>{
    try{
        const user =await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})


        return {accessToken,refreshToken};


    }catch(error){
        throw new APiError(500,"Something Went Wrong While Generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    // Get User Details From Frontend
    // Validation if not empty
    //Check if user is already exists:username,email
    // check fro images,check for avtar;
    // upload them to cloudinary,avtar
    //create user object-create entry in db
    // Remove password and refresh token field from response
    // check for user creation
    // return response
    // .if not created then return error
    // console.log(req.body)
    const {fullName,email,username,password} = req.body
    console.log(email);

    // console.log("email",email);
    // console.log("username",username)

    //Validation
    // if(fullName===""){
    //     throw new APiError(400,"FullName is Required");
        
    // } 

    if(!username || email || (!username && !email)){
        throw new APiError(400,"userName or email is Required")
    }
    if([fullName,email,username,password].some((field)=>
        field?.trim()==="")){
            throw new APiError(400,"All Fields are Required");
     }
     if (!validator.isEmail(email)) {
        throw new APiError(400,"Enter Valid Email");
    }
    // Check wheather user already present or not
    const existedUser=await User.findOne({  //or operator can't be same
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new APiError(409,"User is Already present ")
    }

    // checking images
    // path stored in multer with origional name
    // console.log(req.files);
    const avtarLocalPath=req.files?.avtar[0]?.path;
    // const coverLocalPath =req.files?.coverImage[0]?.path;

    let coverLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverLocalPath =req.files.coverImage[0].path;
    }

    if(!avtarLocalPath){
        throw new APiError(400,"Avtar File is Required");


    }

    // uploading images into cloudnary
   //because image uploading take some time
    const avtar=await uploadOnCloudinary(avtarLocalPath);
    const coverImage=await uploadOnCloudinary(coverLocalPath);
    
    if(!avtar){
        throw new APiError(400,"Avtar File is Required");
    }

    // Now Creating Entry in DataBase

   const user=await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })
    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
        //response me ye dono field nhi select krna h
    );

    if(!createdUser){
        throw new APiError(500,"Something Went wrong While Registering the User")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered SuccessFully")
    );
});



const loginUser=asyncHandler(async(req,res)=>{
    // req->body data
    // username
    // email
    // find the user
    // password check
    // access and refresh toekn
    // Send  secure cookies
    const {username,email,password}=req.body;

    if(!username || !email){
        throw new APiError(400,"UserName and Email is required");
    }
    if(!password){
        throw new APiError(400,"Password is Required")
    }
    // check  email | username present 
    const user=await User.findOne({
        $or:[{username},{email}]
    });

    if(!user){
        throw new APiError(404,"User Does not Exist Please Register")
    }
   //userdefined method already defined in user model
    const isPasswordValid =await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new APiError(401,"Invalid User Credentials")
    }

    const{accessToken,refreshToken}=await 
    generateAccessAndRefreshTokens(user._id)

   const loggedInUser=await User.findById(user._id)
   .select("-password -refreshToken")

   const options={
       httpOnly:true,
       secure:true
   }

   return res.status(200).
   cookie("accessToken",accessToken,options).
   cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },"User LoggedIn SuccessFully")
   )
})


const logOutUser =asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User LoggedOut SuccessFully"))
})

// Token again Refresh Karane ke liye EndPoint

const refreshAceesToken =asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


   if(!incomingRefreshToken){
      throw new APiError(401, "Unauthorized request");
   }
   
    try {
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new APiError(401, "Invalid refresh Token");
         }
    
         if(incomingRefreshToken !==user?.refreshToken){
            throw new APiError(401,"Refresh token is Expired or Used")
         }
        //  if matched
    
        const options={
            httpOnly:true,
            secure:true
        }
        
        const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToke",refreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshAceesToken:newRefreshToken
                },
                "Access token refershed Successgully"
            )
        )
    } catch (error) {

        throw new APiError(401,error?.message || "Invalid Refresh Token")
        
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassWord, newPassword}=req.body
    const user =await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassWord)
    if(!isPasswordCorrect){
        throw new APiError(400,"Invalid Old Password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,"password Changed SuccessFully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"Current User fetched Successfully");
})

const updateAccountDetails =asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName || !email){
        throw new APiError(400,"All fields are Required")
    }

    User.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                fullName:fullName,
                email:email
            }

        },
        {
            new:true //optional this will return updated information
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
});

const updateUserAvatar =asyncHandler(async(req,res)=>{
    
    // we can get from multer middleware
    const avtarLocalPath=req.file?.path
    if(!avtarLocalPath){
        throw new APiError(400,"Avatar file is missing")
    }

    const avatar =await uploadOnCloudinary(avtarLocalPath)

    if(!avatar.url){
        throw new APiError(400,"Error while uploading on avatar")
    }

    const user= await User.findByIdAndUpdate(req.user?._id,
        {

            $set:{
                avatar:avatar.url
            }


        },{
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Avatar is Updated SuccessFully"))

})
const updateUserCoverImage =asyncHandler(async(req,res)=>{
    
    // we can get from multer middleware
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new APiError(400,"CoverImage file is missing")
    }

    const coverImage =await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new APiError(400,"Error while uploading on Cover-Image")
    }

   const user= await User.findByIdAndUpdate(req.user?._id,
        {

            $set:{
                coverImage:coverImage.url
            }
        },{
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"CoverImage is Updated SuccessFully"))

})
export  {registerUser ,
    loginUser ,
    logOutUser,
    refreshAceesToken,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage
};
