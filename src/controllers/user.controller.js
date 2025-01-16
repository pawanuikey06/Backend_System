import asyncHandler from '../utils/asyncHandler.js';  // Ensure asyncHandler is correct
import APiError from "../utils/APiError.js";
import ApiResponse from '../utils/ApiResponse.js';
import validator from 'validator';
import { User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
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
    const {fullName,email,username,password} = req.body
    console.log("email",email);
    console.log("username",username)

    //Validation
    // if(fullName===""){
    //     throw new APiError(400,"FullName is Required");
        
    // } 
    if([fullName,email,username,password].some((field)=>
        field?.trim()==="")){
            throw new APiError(400,"All Fields are Required");
     }
     if (!validator.isEmail(email)) {
        throw new APiError(400,"Enter Valid Email");
    }
    // Check wheather user already present or not
    const existedUser=User.findOne({  //or operator can't be same
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new APiError(409,"User is Already present ")
    }

    // checking images
    // path stored in multer with origional name

    const avtarLocalPath=req.files?.avtar[0]?.path;
    const coverLocalPath =req.files?.coverImage[0]?.path;

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

export default registerUser;
