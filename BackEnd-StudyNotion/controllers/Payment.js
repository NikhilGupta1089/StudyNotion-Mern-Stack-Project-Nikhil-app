const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");


/* --------------------------------------------------------------* {Payment Code For Multiple Courses} *----------------------------------------------------------------*/
// capture the payment and initiate the  order
exports.capturePayment = async(req, res) => {
    
     const {courses} = req.body;
     const userId = req.user.id;

     if(courses.length === 0){
        return res.json({success:false, message:"Please Provide Course Id"})
     }

     let totalAmount = 0;

     for(const course_id of courses) {
          let course;
          try{

               // fetch course_details
               course = await Course.findById(course_id);
               if(!course){
                return res.status(400).json({success:false, message:'Could not find the course'})
               }

               // Check Is Student already enrolled in that particulae course
               const uid = new mongoose.Types.ObjectId(userId);
               if(course.studentsEnrolled.includes(uid)){
                  return res.status(401).json({success:false, message:'Student is already Enrolled'})
               }

               totalAmount += course.price;

          }
          catch(error){
              console.log(error)
              return res.status(500).json({success:false, message:error.message})
          }
     }

     const options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: Math.random(Date.now()).toString(),
     }

    // console.log("🔍 Order creation options:", options);
   

     try {
           const paymentResponse = await instance.orders.create(options);
           //console.log("payMent Response: ", paymentResponse)
           res.json({
            success:true,
            data:paymentResponse,
           })
     }
     catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Could not Initiate Order"
        })
     }

}

// Verify the Payment
exports.verifyPayment = async(req,res) => {
     const razorpay_order_id = req.body?.razorpay_order_id;
     const razorpay_payment_id = req.body?.razorpay_payment_id;
     const razorpay_signature = req.body?.razorpay_signature;
     const courses = req.body?.courses;
     const userId = req.user.id;

     if( !razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
        !courses || !userId) {
            return res.status(401).json({success:false, message:'Payment Failed'})
        }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_SECRET)
          .update(body.toString())
          .digest("hex");
          
    // Verify Signature of Razorpay and Server
    if(expectedSignature === razorpay_signature) {
        // Enroll kawao student ko
        await enrollStudents(courses, userId, res);
        
        return res.status(200).json({success:true, message:'Payment Verified'})
    }
    
    return res.status(400).json({success:false, message: 'Payment Failed'})
}


// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
 const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId){
        return res.status(400).json({success:false, message:'Please provide data for courses or userId'})
    }

    for(const courseId of courses) {

     try{ 
        // find the course ans enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {
                $push:{studentsEnrolled: userId}
            },
            {new: true},
        )

        if(!enrolledCourse){
            return res.status(400).json({success:false, message:'Course not Found'})
        }

        const courseProgress = await CourseProgress.create({
            courseID:courseId,
            userId:userId,
            completedVideos: [],
        })

        // find the student and add the course to their list of enrolledCourses
        const enrolledStudent = await User.findByIdAndUpdate(userId, 
        {
            $push:{
                courses: courseId,
                courseProgress: courseProgress._id,
            }
        },{new:true}
     )

       // Send Email to student
       const emailResponse = await mailSender(
         enrolledStudent.email,
         `Successfully Enrolled into ${enrolledCourse.courseName}`,
         courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
       )
       // console.log("Email Sent Successfully", emailResponse.response);

    }
    catch(error){
       console.log(error)
       return res.status(500).json({success:false, message: error.message})
    }

  } 

 }





/* --------------------------------------------------------------* {Payment Code For Single Course} *----------------------------------------------------------------*//*

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req , res) => {

    // Get courseId and UserID
    const {course_id} = req.body;
    const userId = req.user.id;

    // Validation

    // Valid courseID
    if(!course_id) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        });
    }

    // Valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }

        // User already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:error.message,
            });
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

    // order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    try {
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        return res.status(200).json({
            success:true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    }
    catch(error){
        console.log(error)
        return res.json({
            success: false,
            message: 'Could not initiate order',
        })
    }
};

// Verify Signature of Razorpay and Server
exports.verifySignature = async(req,res) => {
    const webhookSecret = "12345678";

    //Razorpay includes a special header called x-razorpay-signature in every webhook request.
    const signature = req.headers["x-razorpay-signature"];

    // crypto.createHmac creates an HMAC object using: SHA-256 hashing algorithm &&  Your webhook secret as the key.
    // This will be used to hash the payload and generate a signature for comparison.
    const shasum = crypto.createHmac("sha256", webhookSecret);

    // JSON.stringify(req.body) ensures the same string format as Razorpay used when generating its signature.
    shasum.update(JSON.stringify(req.body));

    // Finalizes & {webhookSecret convert into digest which is hashed} the HMAC hash and outputs it as a hexadecimal string.
    const digest = shasum.digest("hex");

    if(signature == digest){
        console.log("Payment is Authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
               // fulfill the action

               // find the course and enroll the student in it
               const enrolledCourse =  await Course.findByIdAndUpdate(
                                              {_id: courseId},
                                              {$push:
                                                {studentsEnrolled: userId}
                                              },
                                              {new:true},
               );

               if (!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not Found',
                })
               }

               console.log(enrolledCourse);

               // find the student and add the course to their list enrolled course me
               const enrolledStudent = await User.findByIdAndUpdate(
                                                 {_id:userId},
                                                 {$push: 
                                                    {courses:courseId}
                                                 },
                                                 {new:true},
               );
                console.log(enrolledStudent);

                // Mail send krdo confirmation wala
                const emailResponse = await mailSender(
                                          enrolledStudent.email,
                                          "Congratulation from CodeHelp",
                                          "Congratulations, you are onboarded into new CodeHelp Course",
                );
                console.log(emailResponse);

                // Return Response
                return res.status(200).json({
                    success:true,
                    message:'Signature Verified and Course Added'
                });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
}

*/