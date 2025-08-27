import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI"
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import NestedView from "./NestedView"

const CourseBuilderForm = () => {

    const { register, handleSubmit, setValue, formState:{errors} } = useForm();
    const [editSectionName, setEditSectionName] = useState(null);
    const {course} =  useSelector((state) => state.course);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const {token} = useSelector((state) => state.auth);


    const onSubmit = async(data) => {
        setLoading(true)
        let result
        

        if(editSectionName)
        {
            // we are editing the section name
            result = await updateSection({
                sectionName: data.sectionName,
                sectionId: editSectionName,
                courseId: course._id,
            }, token )
        }
        else {
           
            result = await createSection({
                sectionName: data.sectionName,
                courseId: course._id,
            }, token )

           // console.log("result", result);
             
        }

        // update values
        if(result) {
            dispatch(setCourse(result));
            setEditSectionName(null);
            setValue("sectionName", "");
            
        }

        // loading false
        setLoading(false);
    }


    const cancelEdit = () => {
        setEditSectionName(null)
        setValue('sectionName', "")
    }

    const goBack = () => {
        dispatch(setStep(1))
        dispatch(setEditCourse(true))
    }

    const goToNext = () => {
        if(course.courseContent.length === 0) {
            toast.error("Please add at least one Section")
            return;
        }

        if(course.courseContent.some((section) => section.subSection.length === 0)){
            toast.error("Please add atleast one lecture in each section");
            return;
        }

        // if everything ig good
        dispatch(setStep(3));
    }

    const handleChangeEditSectionName = (sectionId, sectionName) => {
        if(editSectionName === sectionId){
            cancelEdit();
            return;
        }

        setEditSectionName(sectionId);
        setValue("sectionName", sectionName);
        
    }

  return (
    <div className="border-[1px] border-richblack-5 bg-richblack-800 p-6 rounded-md space-y-8">
        <p  className="text-2xl font-semibold text-richblack-5">Course Builder</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="sectionName">
                   Section Name <sup className="text-pink-200">*</sup>
                </label>
                <input
                    id='sectionName'
                    disabled={loading}
                    placeholder='Add section name'
                    {...register('sectionName', {required:true})}
                    className='w-full form-style'
                />
                {
                    errors.sectionName && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                          Section name is required
                       </span>
                    )
                }
            </div>

            <div className='flex gap-x-4 items-end'>
                <IconBtn
                 type="submit"
                 text={editSectionName ? "Edit Section Name" : "Create Section"}
                 outline={true}
                 customClasses={"text-white"}
                 >
                    <IoAddCircleOutline size={20} className="text-yellow-50" />

                </IconBtn>
                {
                    editSectionName && (
                        <button
                        type="button"
                        onClick={cancelEdit}
                        className='text-sm text-richblack-300 underline ml-10'
                        >
                            Cancel Edit
                        </button>
                    )
                }
            </div>
        </form>

        {
            course.courseContent.length > 0 &&  (
                <NestedView handleChangeEditSectionName={handleChangeEditSectionName}/>
            )
        }

        {/* Next Prev Button */}
        <div className='flex justify-end gap-x-3'>
            <button
             onClick={goBack}
             className='rounded-md cursor-pointer flex items-cente gap-x-2 bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900'>
                Back
            </button>
            <IconBtn disabled={loading} text="Next" onclick={goToNext}>
                 <MdNavigateNext />
            </IconBtn>
        </div>
      
    </div>
  )
}

export default CourseBuilderForm
