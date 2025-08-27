const  User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const { response } = require("express");
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
require("dotenv").config();
const emailTemplate = require("../mail/templates/emailVerificationTemplate")



/* SIGN UP CONTROLLER FOR REGISTRATING USERS */

exports.signUp = async (req , res) => {

  try{
    
    // Data fetch from request ki body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp
  } = req.body;

  // Validation of data
  if(!firstName || !lastName || !email || !password || !confirmPassword
      || !otp ) {
          return res.status(403).json({
              success:false,
              message:"All fields are required",
          });
      }

   // Check if password and confirm password match
   if(password !== confirmPassword){
    return res.status(400).json({
      success:false,
      message:'Password and ConfirmPassword Value does not match, please try again',
    });
   }

   // Checking User already exist or not
   const existingUser = await User.findOne({email});
   if(existingUser){
    return res.status(400).json({
      success:false,
      message:'User is already registered',
    });
   }

   // Finding most recent OTP stored for the user
   const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);   //this query used for finding the recent OTP
   console.log(recentOtp);

   // Validation of OTP
   if(recentOtp.length === 0){
    // OTP not found
    return res.status(400).json({
      success:false,
      message:'OTP not Found',
    });
   } else if(otp !== recentOtp[0].otp) {
    // Invalid OTP
    return res.status(400).json({
      success:false,
      message:"Invalid OTP",
    });
   }


   // Hashing of Password
   const hashedPassword = await bcrypt.hash(password, 10);

   // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

   // Create the Additional Profile For User in Database(DB)
   const profileDetails = await Profile.create({
    gender:null,
    dateOfBirth: null,
    about: null,
    contactNumber: null,
   });

   const user = await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
    password:hashedPassword,
    accountType: accountType,
		approved: approved,
    additionalDetails:profileDetails._id,
    image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
   });

   // Return Response
   return res.status(200).json({
    success:true,
    message:'User is registered Successfully',
    user,
   });

  }
  catch(error){
    console.log(error);
    return res.status(500).json({
      success:false,
      message:"User cannot be registered, Please try again",
    });
  }

}


/*  LOGIN CONTROLLER FOR AUTHENTICATING USERS */
exports.login = async (req, res) => {
   try{

        // Get data{email,password} from request body
        const {email, password} = req.body;

        // Validation of data - Check if email or password is missing
        if(!email || !password) {
          return res.status(400).json({
            success:false,
            message:'All fields are required, Please try again',
          });
        }

       // Find user with provided email
        const user = await User.findOne({email}).populate("additionalDetails");

        // If user not found with provided email
        if(!user) {
          return res.status(401).json({
               success:false,
               message:"User is not registered, please signup first",
          });
        }

        // Generate JWT token, after Compare the Password
        if(await bcrypt.compare(password, user.password)){

          const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
          }
          
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            // Save token to user document in database
            user.token = token;
            user.password = undefined;

            // Create Cookies for token and send response
            const options = {
              expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              httpOnly:true,
            }

            res.cookie("token", token, options).status(200).json({
              success:true,
              token,
              user,
              message:'Logged in successfully',
            })

        }
        else{
          return res.status(401).json({
            success:false,
            message:'Password is incorrect',
          });
        }
   

   }
   catch(error){
           console.log(error);
           // Return 500 Internal Server Error status code with error message
           return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
           })
   }
};


/*  SEND OTP CONTROLLER for Email Verification  */

exports.sendOTP = async (req , res) => {

  try{

      // fetch email from request ki body
      const {email} = req.body;

      // Check if user is already present
		// Find user with provided email
      const checkUserPresent = await User.findOne({email});
  
      // if user already exist, then return a response
      if(checkUserPresent) {
          return res.status(401).json({
              success:false,
              message:'User already registered',
          })
      }

      // Generate OTP
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
      });
     // console.log("OTP generated: ", otp);

      // check unique otp or not
      let result = await OTP.findOne({otp: otp});
     
		 // console.log("Result", result);

      while(result){
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
        });

        
      }

      const otpPayload = {email, otp};

      // create an entry for OTP
      const otpBody = await OTP.create(otpPayload);
 

        // Send OTP email
      try {
          const mailResponse = await mailSender(
              email,
              "Verification Email from StudyNotion",
              emailTemplate(otp) // make sure your emailTemplate function returns HTML string
          );
        //  console.log("OTP Email sent successfully:", mailResponse.response);
      } catch(error) {
          console.error("Failed to send OTP email:", error);
      }

      // return response successfully
      res.status(200).json({
        success: true,
        message:'OTP Sent Successfully',
        otp,
      })

  }
  catch(error){
         console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
         })
  }
};


/* PASSWORD CHANGING CONTROLLER  */

exports.changePassword = async(req, res) => {
  try {
       // Get user data from req.user
       const userDetails = await User.findById(req.user.id);

       // Get old password, new password, and confirm new password from req.body
       const {oldPassword, newPassword} = req.body;

       // validate old password
       const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password,
       );
       if(!isPasswordMatch){
        return res.status(401).json({
          success:false,
          message:"This password is incorrect",
        });
       }
   
       /*
       // Match new password and confirm new password
       if(newPassword !== confirmNewPassword) {
          return res.status(400).json({
            success:false,
            message:"This password and confirm password do not match",
          }); 
       }  */

       // Update password
       const encryptedPassword = await bcrypt.hash(newPassword, 10);
       const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword},
            {new: true},
       );

       // Send Notification email
       try {
           const emailResponse = await mailSender(
                  updatedUserDetails.email,
                  `Password Updated`,
                  passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                  )
           );
          // console.log("Email sent successfully:", emailResponse.response);
       }
       catch(error){
        console.error("Error occured while sending email:", error);
        return res.status(500).json({
          success:false,
          message:"Error occured while sending email",
          error: error.message,
        });
       }

       // Return response
       return res.status(200).json({
          success:true,
          message:"Password updated successfully",
        });
       
  }
  catch(error){
      console.error("Error occurred while updating password:", error);
		  return res.status(500).json({
			  success: false,
			  message: "Error occurred while updating password",
			  error: error.message,
		});
  }
}