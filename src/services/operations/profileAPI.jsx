import React from 'react'

import { apiConnector } from '../apiconnector'
import {setUser } from '../../slices/profileSlice'
import {logout} from "./authAPI"
import { profileEndpoints } from '../apis'

import {toast} from "react-hot-toast"


const { GET_USER_DETAILS_API, GET_USER_ENROLLED_COURSES_API, GET_INSTRUCTOR_DATA_API, } = profileEndpoints


export function getUserDetails(token, navigate) {
    return async (dispatch) => {
         const toastId = toast.loading("Loading....")
       
         try {
              const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
                 Authorization: `Bearer ${token}`,
              })
              console.log("GET_USER_DETAILS_API RESPONSE...........",response)

              if(!response.data.success){
                 throw new Error(response.data.message)
              }
               toast.dismiss(toastId)

              const userImage = response.data.data.image ?
                  response.data.data.image :
                  `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`

                  dispatch(setUser({...response.data.data, image: userImage}))
         }
         catch(error) {
            toast.dismiss(toastId)
             dispatch(logout(navigate))
             console.log("GET_USER-DETAILS API ERROR............", error)
             toast.error("Could Not Get User Details")
         }
        
       
    }
}


export async function getUserEnrolledCourses(token) {
   
    let result = []
     
    try {
        
          const response = await apiConnector("GET", GET_USER_ENROLLED_COURSES_API, null, {
            Authorization: `Bearer ${token}` ,
          })
          console.log("Enrolled Response", response)

          if(!response.data.success){
            throw new Error(response.data.message)
          }
         
          result = response?.data.data
    }
    catch(error) {
       
        console.log("GET_USER_ENROLLED_COURSES_API API ERROR............",error)
        toast.error("Could Not Get Enrolled Courses")
    }
  
    return result
}


export async function getInstructorData(token) {
    const toastId = toast.loading("Loading...")
    let result = []
    
    try {
           
          const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
            Authorization: `Bearer ${token}` ,
          })
           
          console.log("ResponseInstructor", response)

          if(!response.data.success){
            throw new Error(response?.data?.message)
          }
          toast.dismiss(toastId)
          console.log(("GET_INSTRUCTOR_API RESPONSE", response))
          result = response?.data?.courses
    }
    catch(error) {
        toast.dismiss(toastId)
        console.log("GET_INSTRUCTOR_API ERROR............",error)
        toast.error("Could Not Get Instructor Data")
    }
 
    return result
}