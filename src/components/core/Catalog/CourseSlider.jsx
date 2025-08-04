import React, { useEffect, useState } from "react"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
// import "../../.."
// Import required modules
import { FreeMode,Autoplay,Navigation, Pagination } from "swiper/modules"

// import { getAllCourses } from "../../services/operations/courseDetailsAPI"
import Course_Card from "./Course_Card"



const CourseSlider = ({Courses}) => {
  return (
    <>
      {
          Courses?.length ? (
            <Swiper
             slidesPerView={1}
             loop={true}
             spaceBetween={25}
             pagination={true}
             modules={[Autoplay, Pagination,FreeMode, Navigation]}
             className='mySwiper max-h-[30rem]'
             autoplay={{
               delay:1000,
               disableOnInteraction: false,
             }}
             navigation={true}
             breakpoints={{
               1024:{slidesPerView:3,}
             }}
             >
                 {
                    Courses?.map((course, index) => {
                       <SwiperSlide>
                             <Course_Card course={course} Height={"h-[250px]"} />
                       </SwiperSlide>
                    })
                 }
            </Swiper>
          ) : (
            <p className="text-xl text-richblack-5">No Course Found</p>
          )
      }
    </>
  )
}

export default CourseSlider
