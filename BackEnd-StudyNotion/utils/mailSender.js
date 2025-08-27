const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
          
          let transporter = nodemailer.createTransport ({
            host: process.env.MAIL_HOST,
             port: 465,
             secure: true, 
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
          })

          let info = await transporter.sendMail({
            from: `"StudyNotion || Owner - by Nikhil Gupta" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
          })
          console.log(info.response);
          return info;
    }
    catch(error){
       console.error("❌ Error sending mail:", error.message);
        return error.message
    }
}

module.exports = mailSender;