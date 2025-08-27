const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


const OTPSchema = new mongoose.Schema({
  
    email: {
        type:String,
        required:true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
           type:Date,
           default: Date.now(),
           expires: 60*5,
    }
    

});


// a function -> to send emails
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", emailTemplate(otp));
        console.log("Email Sent Successfully: ", mailResponse);
    }
    catch(error){
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}
/*
// Pre Middleware use for sending OTP
// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});
*/
OTPSchema.post("save", async function (doc) {
    if (doc.isNew) {
        console.log("Sending OTP to:", doc.email, "OTP:", doc.otp);
        try {
            const mailResponse = await sendVerificationEmail(doc.email, doc.otp);
            console.log("Email sent successfully:", mailResponse.response);
        } catch (err) {
            console.error("Failed to send OTP email:", err);
        }
    }
});


module.exports = mongoose.model("OTP", OTPSchema);

//module.exports = OTP;