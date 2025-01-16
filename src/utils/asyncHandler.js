const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)) // This should execute the passed requestHandler
        .catch((err) => next(err)); // Catch errors and pass them to the next middleware
    };
  };
  
  export default asyncHandler;
  

// other METHOD

/*
const asyncHandler =(fn)=>async(req,res,next)=>{
    try{
        await fn(req,res,next);

    }catch(error){
        res.status(error.code ||500).json({
            success:false,
            message:error.message
        })
    }
}

*/
