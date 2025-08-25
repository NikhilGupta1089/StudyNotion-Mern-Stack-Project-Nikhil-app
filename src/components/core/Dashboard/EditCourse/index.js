import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import {
  fetchCourseDetails,
  getFullDetailsOfCourse,
} from "../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import RenderSteps from "../AddCourse/RenderSteps"

export default function EditCourse () {

    const dispatch = useDispatch();
    const {courseId} = useParams();
    const {course} = useSelector((state) => state.course);
    const [loading, setLoading] = useState(false);
    const {token} = useSelector((state) => state.auth)

    useEffect(() => {
        const populateCourseDetails = async() =>{
            setLoading(true)
            const result = await getFullDetailsOfCourse(courseId, token);
            if(result?.courseDetails) {
                dispatch(setEditCourse(true))
                dispatch(setCourse(result?.courseDetails))
            }
            setLoading(false)
        }
        populateCourseDetails();
    },[])

    if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div > 
      <h1 className="text-3xl text-richblack-5 font-medium mb-14">
        Edit Course
      </h1>
      <div className="mx-auto max-w-[600px]">
         {
             course ? (<RenderSteps/>) : 
             (
              <p className="text-3xl text-richblack-100 font-semibold text-center mt-14">
                 Course Not Found
              </p>
             )
         }
      </div>
      
    </div>
  )
}

 
