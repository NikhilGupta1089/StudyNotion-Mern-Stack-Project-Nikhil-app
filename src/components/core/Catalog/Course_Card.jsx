import React, { useEffect, useState } from 'react'
import { FaRegStar, FaStar } from "react-icons/fa"
import ReactStars from "react-rating-stars-component"
import { Link } from "react-router-dom"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"

const Course_Card = ({course, Height, width}) => {

  

  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReview);
    setAvgReviewCount(count)
  },[course])

  return (
    <div className='text-white'>
         <Link to={`/courses/${course._id}`}>
              <div>
                  <div className='rounded-lg'>
                      <img
                        src={course?.thumbnail}
                        alt="CourseThumbnail"
                        className={`${Height} ${width} rounded-xl object-cover`}
                      />
                  </div>
                  <div className='flex flex-col gap-2 px-1 py-3'>
                     <p className='text-xl text-richblack-5'>{course?.courseName}</p>
                     <p className='text-sm text-richblack-50'>{course?.instructor?.firstName} {course?.instructor?.lastName}</p>
                     <div className='flex gap-2 items-center'>
                        <span className='text-yellow-5'>{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount}/>
                        <span className='text-richblack-400'>{course?.ratingAndReview?.length} Ratings</span>
                     </div>
                     <p className='text-xl text-richblack-5'>Rs. {course?.price}</p>
                  </div>
              </div>
         </Link>
      
    </div>
  )
}

export default Course_Card
