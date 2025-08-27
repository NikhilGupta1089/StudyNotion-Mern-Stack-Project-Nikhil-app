const Category = require("../models/Category");
const Course = require("../models/Course");

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// Create Category ka handler function

exports.createCategory = async (req, res) => {
    try{
          // fetch data
          const {name, description} = req.body;
          // validation
          if(!name) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
          }

          // create entry in DB
          const CategorysDetails = await Category.create({
            name:name,
            description:description,
          });
         // console.log("CategorysDetails: ", CategorysDetails);

          // return response
          return res.status(200).json({
            success:true,
            message:"Categorys Created Successfully",

          })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
};

// getAllCategory handler function

exports.showAllCategories = async (req, res) => {
    try {
        const allCategorys = await Category.find();
        res.status(200).json({
            success:true,
            message:"All Categorys returned successfully",
            data:allCategorys,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }

};

// categoryPageDetails ka handler function

exports.categoryPageDetails = async (req ,res) => {
  /* console.log("Incoming request body:", req.body); // ✅ should show { categoryId: '...' } */
    try {
         const {categoryId} = req.body;
         
        //  console.log("selectedCategory", categoryId);
         // Get courses for the speified category
         // selectedCategory contain courseId so by using "populate", selectedCategory conatins courses related to courseId
          const selectedCategory = await Category.findById(categoryId)
           .populate({
               path: "courses",
               match: { status: "Published" },
               populate: "ratingAndReviews",
             })
            .exec()
       //  console.log("SELECTED COURSE", selectedCategory)

         // Handle the case when the category is not found
         if(!selectedCategory){
            console.log("Category not found");
            return res.status(404).json({
                success:false,
                message:"Category not found",
            });
         }

         // Handle the case where there are no courses
         if(selectedCategory.courses.length === 0){
            console.log("No courses found for the  selected category");
            return res.status(404).json({
                success:false,
                message:"No courses found for the selected category",
            });
         }

         // Get courses for other categories
         const categoriesExceptedSelected = await Category.find({
            _id: { $ne: categoryId },
         }).populate("courses");

         let differentCategory = await Category.findOne(
         categoriesExceptedSelected[getRandomInt(categoriesExceptedSelected.length)]
           ._id
       )
         .populate({
           path: "courses",
           match: { status: "Published" },
         })
         .exec()

         // Get top-selling courses across all categories
         //find all Categories
         const allCategories = await Category.find()
          .populate({
            path: "courses",
            match: { status: "Published" },
          })
          .exec()

         //find all Courses by using flatMap function
         const allCourses = allCategories.flatMap((category) => category.courses);
         const allCategoriesCourses = allCategories.flatMap((category) => category.courses); // Repeat this bcz i don't want to sort this
         
         //
         const mostSellingCourses = allCourses.sort((a ,b) => b.studentsEnrolled.length - a.studentsEnrolled.length);

         // Return Response
         res.status(200).json({
            success:true,
            message:"Successfully fetched CategoryPageDetail",
            data : {
            selectedCategory,
            differentCategory,
            mostSellingCourses,
            allCategoriesCourses,
            }, 
         })
    }
    catch(error){
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
};
