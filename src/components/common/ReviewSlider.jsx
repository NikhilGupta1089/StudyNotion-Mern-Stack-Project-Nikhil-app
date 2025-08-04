import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay, FreeMode, Pagination } from "swiper/modules"
import { FaStar } from "react-icons/fa"
import ReactStars from "react-rating-stars-component"

import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([])
  const truncateWords = 20

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data } = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API)
        if (data?.success) {
          setReviews(data?.data)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }

    fetchAllReviews()
  }, [])

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-10">
      <Swiper
        spaceBetween={24}
        loop={true}
        freeMode={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[FreeMode, Pagination, Autoplay]}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="w-full"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index} className="!flex">
            <div className="flex flex-col justify-between bg-richblue-800 text-richblack-25 p-4 rounded-lg shadow-md w-full">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={
                    review?.user?.image
                      ? review?.user?.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                  }
                  alt="User"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-richblack-5">
                    {review?.user?.firstName} {review?.user?.lastName}
                  </p>
                  <p className="text-xs text-richblack-400">
                    {review?.course?.courseName}
                  </p>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-sm text-richblack-50 mb-3 line-clamp-3">
                {review?.review.split(" ").length > truncateWords
                  ? `${review.review.split(" ").slice(0, truncateWords).join(" ")}...`
                  : review.review}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <p className="text-yellow-100 font-bold">
                  {review?.rating?.toFixed(1)}
                </p>
                <ReactStars
                  count={5}
                  value={review.rating}
                  size={18}
                  edit={false}
                  activeColor="#ffd700"
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ReviewSlider
