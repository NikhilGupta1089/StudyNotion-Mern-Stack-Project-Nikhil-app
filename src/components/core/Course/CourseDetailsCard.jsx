import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

const CourseDetailsCard = ({course, setConfirmationModal, handleBuyCourse,}) => {

   const {cart} = useSelector((state) => state.cart)
    const {user} = useSelector((state) => state.profile);
    const {token} = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

     const isCourseInCart = cart.some((item) => item._id === course._id)

    const handleAddToCart = () => {
          if(user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR){
            toast.error("You are an Instructor, you cant buy a course");
            return;
          }
          if(token) {
            if(!isCourseInCart){
                dispatch(addToCart(course))
            } else {
                 navigate("/dashboard/cart")
            }  
            return;
          }
          setConfirmationModal({
            text1:"You are not logged in",
            text2:"Please login to add to cart",
            btn1Text:"Login",
            btn2Text:"Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setConfirmationModal(null),
          })
    }

    const handleShare = () => {
         copy(window.location.href);
         toast.success('Link Copied to Clipboard')
    }

  return (
    <div className="bg-richblack-700 rounded-md flex flex-col gap-4 p-4 text-richblack-5">
         <img
            src={course.thumbnail}
            alt={course?.courseName}
            className="w-[400px] max-h-[300px] min-h-[180px] overflow-hidden rounded-2xl object-cover md:max-w-full"
         />
         <div className="pb-3 text-3xl font-semibold space-x-3">
            Rs. {course.price}
         </div>
         <div className="flex flex-col gap-4">
             <button
             className="yellowButton"
             onClick={
                 user && course?.studentsEnrolled.includes(user?._id) ?
                 () => navigate("/dashboard/enrolled-courses") :
                 handleBuyCourse
             }
             >
                  {
                     user && course?.studentsEnrolled.includes(user?._id) ?
                     "Go to course" :
                     "Buy Now"
                  }
             </button>

             {
                (!user || !course?.studentsEnrolled.includes(user?._id)) && (
                    
                    <button
                     onClick={handleAddToCart} className="blackButton">
                         { !isCourseInCart ? "Add to Cart" : "Go to Cart"}
                    </button>
                )
             }
         </div>

         <div>
             <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
               30-Day-Money-Back Gurantee
              </p>
             <p className="my-2 text-xl font-semibold">
               This Course Includes:
             </p>
             <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
                 {
                    course?.instructions?.slice(0,3).map((item, index) => (
                        <p key={index}
                          className="flex gap-2">
                           <BsFillCaretRightFill />
                            <span>{item}</span>
                        </p>
                    ))
                 }
             </div>
         </div>
         <div className="text-center">
              <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100"
               onClick={handleShare}
               >
                 <FaShareSquare size={15} /> Share
              </button>
         </div>
    </div>
  )
}

export default CourseDetailsCard
