const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")


// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
 try {
        // get email from req body
    const email = req.body.email;

    // check user for this email , email validation
    const user = await User.findOne({email:email});
    if(!user) {
        return res.status(401).json({
            success:false,
            message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
        })
    }

    // Generate token 
    //const token = crypto.randomUUID();
    const token = crypto.randomBytes(20).toString("hex");

    // update user by adding token and expiring time
    const updatedDetails = await User.findOneAndUpdate(
                                {email:email}, 
                                { 
                                    token:token, 
                                    resetPasswordExpires: Date.now() + 5*60*1000,
                                }, 
                                {new:true});

     console.log("DETAILS", updatedDetails);                           

    // create url                            
    const url = `http://localhost:3000/update-password/${token}`

    // send mail containing the url
    await mailSender(email,
                     "Password Reset",
			         `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    // return response
    return res.json({
        success:true,
        message:'Email sent successfully, please check email and change pwd',
    });
 }
  catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail',
        });
    }
}

// resetPassword
exports.resetPassword = async (req, res) => {

 try{
    // data fetch
    const {password, confirmPassword, token} = req.body;

    // validation
    if(password !== confirmPassword){
        return res.json({
            succcess:false,
            message:'Password and Confirm Password Does not Match',
        });
    }

    // get userdetail from db using token
    const userDetails = await User.findOne({token: token});

    // if no entry - invalid token
    if(!userDetails) {
        return res.json({
            success:false,
            message:'Token is invalid',
        });
    }

    // token time check
    if( userDetails.resetPasswordExpires < Date.now() ) {
        return res.json({
            success:false,
            message:'Token is expired, please regenrated your token',
        });
    }

    // Hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Password update
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    );

    // return response
    return res.status(200).json({
        success:true,
        messsage:'Password reset successfully',
    }); 

 } 
 catch(error){
     console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail',
 });

}

};
