const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const mongoose = require("mongoose")


/* CREATE Rating Handler */

exports.createRating = async (req, res) => {
    try{
           // Get User Id
           const userId = req.user.id;

           // Fetch data from Request Body
           const {rating, review, courseId} = req.body;

           // Check If User is Enrolled or not 
           const courseDetails = await Course.findOne(
                                        {_id:courseId,
                                            studentsEnrolled: {$elemMatch: {$eq: userId} },
                                        });

           // Validation
           if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message: 'Student is not enrolled in this course',
            });
           }  

           // Check if user already reviewed the course
           const alreadyReviewed = await RatingAndReview.findOne({
                                                   user:userId,
                                                   course:courseId,
                                             });
           if(alreadyReviewed) {
              return res.status(403).json({
                success:false,
                message:'Course is already reviewd by the user',
              })
           }

           // Create Rating And Review
           const ratingReview = await RatingAndReview.create({
                                              rating, review,
                                              course:courseId,
                                              user:userId,
                                              
                                           });


            // Update Course with this Rating/Review
           const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId},
                                        {
                                            $push: {
                                                ratingAndReviews: ratingReview._id,
                                            }
                                        },
                                        {new: true});

             console.log(updatedCourseDetails); 
             
           /*  await updatedCourseDetails.save(); */
                                        
            // Return Response
            return res.status(200).json({
                success:true,
                message:"Rating and Review created Successfully",
                ratingReview,
            });                            
            
    }
    catch(error) {
           console.log(error);
           return res.status(500).json({
            success:false,
             message: "Internal server error",
             error: error.message,
           });
    }
};


/* GET AVERAGE Rating Handler */

exports.getAverageRating = async (req, res) => {
     try {

           // Get course ID
           const courseId = req.body.courseId;

           // Study about 'match' & 'group' & 'avg' operator in aggregate function,
           // Calculate Avg Rating
           const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id:null,
                    averageRating: { $avg: "$rating"},
                }
            }
           ])

           // Return Rating
           if(result.length > 0) {
              return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
              });
           }

           // If no Rating/Review exist
           return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no rating given till now',
            averageRating:0,
           });

     }
     catch (error){
          console.log(error);
           return res.status(500).json({
            success:false,
            message:error.message,
           });
     }
}


/* GET ALL Rating And Reviews Handler Function */

exports.getAllRating = async (req, res) => {
    try {

        const allReviews = await RatingAndReview.find({})
                                 .sort({rating: "desc"}) 
                                 .populate({
                                    path: "user",
                                    // 'select' is used for fetched the specific data,
                                    // Just like in user path only firstName, lastName, email, and image will be fetched,
                                    select: "firstName lastName email image",
                                 })
                                .populate({
                                    path: "course",
                                    select: "courseName",
                                })
                                .exec(); 

        return res.status(200).json({
            success:true,
            message:"All reviews fetched Successfully",
            data: allReviews,
        });

    }
    catch(error){
        console.log(error);
           return res.status(500).json({
            success:false,
            message: "Failed to retrieve the rating and review for the course",
            error: error.message,
           });
    }
}