const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")

exports.updateProfile = async (req , res) => {
    try{

        //get data
        const {
           firstName = "",
           lastName = "",
           dateOfBirth = "",
           about = "",
           contactNumber = "",
           gender = "",
         } = req.body
         
        
        // get userId
        const id = req.user.id;

        // validation
        if(!contactNumber || !dateOfBirth || !id) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        const user = await User.findByIdAndUpdate(id, {
          firstName,
          lastName,
        })
        await user.save()

        // update profile field
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        /* Two methods to save the date into database (1) By using the create function 
           (2) by using the save function */

        // Here the object created but didn't save in DB So,
        await profileDetails.save();

        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec()

        // return response
        return res.status(200).json({
            success:true,
            message:'Profile updated Successfully',
            updatedUserDetails, 
        })

    }
    catch(error){
          return res.status(500).json({
            success:false,
            error: error.message,
          })
    }
}


/* Delete Account */
// Explore -> how can we schedule this deletion operation, {study -> chrone job}
exports.deleteAccount = async (req , res) => {
   console.log("printing id:")
    try{
        // TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
        //get id
       // console.log("printing id:", req.user.id)
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }

         // Delete Assosiated Profile with the User
        await Profile.findByIdAndDelete({
          _id: new mongoose.Types.ObjectId(userDetails.additionalDetails),
       })

        // TODO : HW unenroll user from all enrolled courses
        for (const courseId of userDetails.courses) {
          await Course.findByIdAndUpdate(
           courseId,
           { $pull: { studentsEnrolled: id } },
           { new: true }
        )
      }

        // delete user
        await User.findByIdAndDelete({_id:id});

        // return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });

        await CourseProgress.deleteMany({ userId: id })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot deleted successfully',
            error: error.message,
          })
    }
}


/* Get all userDetails */
exports.getAllUserDetails = async (req,res) => {
    try {
        //get id
        const id = req.user.id;

        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
       

        // return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data:userDetails,
        });
    }
    catch(error){
         return res.status(500).json({
            success:false,
            error: error.message,
          })
    }
};


/* UPDATE Display Picture */

exports.updateDisplayPicture = async (req,res) => {
 
    try {

        // fetch input{new} display picture
        const displayPicture = req.files.displayPicture;

        // fetch userId
        const userId = req.user.id;

        // Upload new image to cloudinary database
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
      //  console.log(image.secure_url);

        // Update the old image by new image
        const updatedProfile = await User.findByIdAndUpdate(
             {_id: userId },
             { image: image.secure_url },
             { new: true }
        )

        
         res.send({
            success:true,
            message:"Image UPdated Successfully",
            data: updatedProfile,
        })

    }
    catch(error){
        return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};


/* Get Enrolled Courses */

exports.getEnrolledCourses = async (req, res) => {
    try {
  
        // Fetch UserId
        const userId = req.user.id;
        
        // fetch User detail
        let userDetails = await User.findOne({
         _id: userId,
       })
         .populate({
           path: "courses",
           populate: {
             path: "courseContent",
             populate: {
               path: "subSection",
             },
           },
         })
         .exec()

         //
         userDetails = userDetails.toObject()
         var SubsectionLength = 0
         for (var i = 0; i < userDetails.courses.length; i++) {
           let totalDurationInSeconds = 0
           SubsectionLength = 0
           for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
             totalDurationInSeconds += userDetails.courses[i].courseContent[
               j
             ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
             userDetails.courses[i].totalDuration = convertSecondsToDuration(
               totalDurationInSeconds
             )
             SubsectionLength +=
               userDetails.courses[i].courseContent[j].subSection.length
           }
           let courseProgressCount = await CourseProgress.findOne({
             courseID: userDetails.courses[i]._id,
             userId: userId,
           })
           courseProgressCount = courseProgressCount?.completedVideos.length
           if (SubsectionLength === 0) {
             userDetails.courses[i].progressPercentage = 100
           } else {
             // To make it up to 2 decimal point
             const multiplier = Math.pow(10, 2)
             userDetails.courses[i].progressPercentage =
               Math.round(
                 (courseProgressCount / SubsectionLength) * 100 * multiplier
               ) / multiplier
           }
         }

        // Validate User details
        if(!userDetails) {
            return res.status(400).json({
                success:false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }


        // Return Responnse
        return res.status(200).json({
            success: true,
            message: ' Enrolled Course feteched Successfully',
            data: userDetails.courses,
        })
    }
    catch(error) {
         return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.instructorDashboard = async(req,res) => {
    try {
          const courseDetails = await Course.find({instructor: req.user.id});

          const courseData = courseDetails.map((course) => {
             const totalStudentsEnrolled = course.studentsEnrolled.length 
             const totalAmountGenerated = totalStudentsEnrolled * course.price 

             // create an object with the additional fields
             const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.Description,
                totalStudentsEnrolled,
                totalAmountGenerated,
             }
             return courseDataWithStats
          })

          return res.status(200).json({courses: courseData, success:true, message:'Instructor course fetched'});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

