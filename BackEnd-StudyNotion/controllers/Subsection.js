const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

/* Create SubSection */

exports.createSubSection = async (req , res) => {
    try{

          // Fetch data from req body
          const {sectionId, title, description} = req.body;

          // extract file/video
          const video = req.files.videoFile || req.files.video;
         // console.log(sectionId,title,description,video)

          // Validation
          if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
          }

          // upload video to cloudinary
          const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

          //console.log(uploadDetails)
          // create a sub section
          const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
          });

          // update section with this sub-section ObjectId
          const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                 {$push:{
                                                       subSection:SubSectionDetails._id,
                                                 }},
                                                 {new:true}
                                               ).populate("subSection");

          //HW: log updated section here, after adding populate query

          // return response
          return res.status(200).json({
            success:true,
            message:'Sub Section Created Successfully',
           data: updatedSection,
          })

    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
         })
    }
}

/* Update SubSection */

exports.updateSubSection = async (req, res) => {
  try {
    // fetch input data
     const { sectionId, subSectionId, title, description } = req.body;

    // fetch SubSection details
    const subSection = await SubSection.findById(subSectionId);

    // Validate
    if(!subSection) {
      return res.status(404).json({
        success:false,
        message: "SubSection not found",
      })
    }

    if(title !== undefined) {
      subSection.title = title
    }

    if(description !== undefined) {
      subSection.description = description
    }

    // Upload video and update
    if(req.files && req.files.video !== undefined) {
      //fetch video
      const video = req.files.video || req.files;
      //upload to cloudinary
      const uploadDetails = await uploadImageToCloudinary(
         video,
         process.env.FOLDER_NAME,
      )
      // update video
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    const updatedSection = await Section.findById(sectionId).populate("subSection")

    // Return response
     return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
     
  }
  catch(error) {
     return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
  }
}


/* Delete SubSection */

 exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data: updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }