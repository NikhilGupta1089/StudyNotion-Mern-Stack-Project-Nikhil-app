import React, { useEffect, useState } from 'react'
import { useForm  } from 'react-hook-form';
import { apiConnector } from "../../services/apiconnector"
import { contactusEndpoint } from "../../services/apis"
import CountryCode from "../../data/countrycode.json"
import {toast} from "react-hot-toast"

const ContactUsForm = () => {

    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitSuccessful}
    } = useForm();

    const submitContactForm = async(data) => {
          console.log("Logging Data: ", data)
          
          try {
             setLoading(true)
             const response = await apiConnector("POST", contactusEndpoint.CONTACT_US_API, data);
             console.log("Logging Response: ", response)
             toast.success("Form Data Sent Successfully");
             setLoading(false)
          }
          catch(error){
            console.log("Error:", error.message);
            setLoading(false)
          }
    }

    useEffect( () => {
        if(isSubmitSuccessful){
            reset({
                email:"",
                firstName:"",
                laseName:"",
                message:"",
                phoneNo:"",
            })
        }
    },[reset, isSubmitSuccessful]);

  return (
    <form onSubmit={handleSubmit(submitContactForm)}
     className='flex flex-col gap-7'>

       <div className='flex flex-col gap-5 lg:flex-row'>
          {/* firstName */}
          <div className='flex flex-col gap-2 lg:w-[48%]'>
             <label htmlFor='firsName' className='label-style'>First Name</label>
             <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder='Enter first name'
                className='form-style'
                {...register("firstName", {required:true})}
             />
             {
                errors.firstName && (
                    <span className='mt-1 text-[12px] text-yellow-100'>
                        Please Enter Your name
                    </span>
                )
             }
          </div>

          {/* lastName -> optional */}
          <div className='flex flex-col gap-2 lg:w-[48%]'>
             <label htmlFor='lastName' className='label-style'>Last Name</label>
             <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder='Enter last name'
                className='form-style'
                {...register("lastName")}
             />
          </div>
       </div>

       {/* Email */}
       <div className='flex flex-col gap-2'>
             <label htmlFor='email' className='label-style'>Email Address</label>
             <input
                type="email"
                name="email"
                id="email"
                placeholder='Enter email address'
                className='form-style'
                {...register("email", {required:true})}
             />
             {
                errors.email && (
                    <span className="-mt-1 text-[12px] text-yellow-100">
                        Please Enter Your email address
                    </span>
                )
             }
        </div>

       {/* Phone Number */}
       <div className='flex flex-col gap-2'>
          
           <label htmlFor='phonenumber' className='label-style'>Phone Number</label>

           <div className='flex gap-5'>

              {/* Dropdown */}
            <div className='flex flex-col gap-2 w-[81px]'>
                <select
                  name="dropdown"
                  id="dropdown"
                  className='form-style'
                  {...register("countrycode", {required:true})}
                  >
                  {
                     CountryCode.map( (element, index) => {
                        return (
                            <option key={index} value={element.code}>
                                {element.code} - {element.country}
                            </option>
                        )
                     })
                  }

                </select>
              </div> 
              {/* phoneNumber */}
            <div className='flex flex-col gap-2 w-[calc(100%-90px)]'>
              <input
                type="number"
                name="phonenumber"
                id="phonenumber"
                placeholder='12345 67890'
                className='form-style' 
                {...register("phoneNo", 
                {
                  required: {value:true, message:"Please enter Phone Number"},
                  maxLength: {value:10, message:"Invalid Phone Number"},
                  minLength: {value:8, message:"Invalid Phone Number"}
                })}
              />
               </div>  
           </div>
           {
              errors.phoneNo && (
               <span className="-mt-1 text-[12px] text-yellow-100">
                  {errors.phoneNo.message}
               </span>
              )
           }

       </div>  

       {/* Message */}
       <div className='flex flex-col gap-2'>
         <label htmlFor='message' className='label-style'>Message</label>
         <textarea
            name="message"
            id="message"
            cols="30"
            rows="7"
            placeholder='Enter Your message here'
            className='form-style'
            {...register("message", {required:true})}
         />
         {
            errors.message && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                    Please enter your message
                </span>
            )
         }
       </div>

       <button
        disabled={loading}
        type="submit"
        className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${
           !loading &&
           "transition-all duration-200 hover:scale-95 hover:shadow-none"
         }  disabled:bg-richblack-500 sm:text-[16px] `}
      >
        Send Message
      </button>
      
     

    </form>
  )
}

export default ContactUsForm
