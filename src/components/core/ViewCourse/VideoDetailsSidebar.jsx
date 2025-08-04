import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import IconBtn from "../../common/IconBtn"

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videobarActive, setVideoBarActive] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const {sectionId, subSectionId} = useParams();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state) => state.viewCourse);

    useEffect(() => {
        ;(() => {
             if(!courseSectionData.length)
                   return;

            const currentSectionIndex = courseSectionData.findIndex(
                  (data) => data._id === sectionId
              )  

            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.
            findIndex(
                (data) => data._id === subSectionId
            ) 
            const activeSubSectionId = courseSectionData[currentSectionIndex].subSection?.[currentSubSectionIndex]?._id; 
            // set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id)
            //set current sub-section here
            setVideoBarActive(activeSubSectionId);
        })()
    },[courseSectionData, courseEntireData, location.pathname])

  return (
    <>
        <div className="sm:w-[320px] sm:max-w-[350px] w-full sm:h-[calc(100vh-3.5rem)] h-maxContent flex flex-col bg-richblack-800 border-r-[1px] border-r-richblack-700">
             {/* for buttons and headings */}
             <div className="flex flex-col gap-2 gap-y-4 items-start justify-between border-b border-richblack-600 mx-5 py-5 text-lg font-bold text-richblack-25">
                 {/* for buttons*/}
                 <div className="flex justify-between items-center w-full">
                     <div
                       onClick={() => {
                        navigate("/dashboard/enrolled-courses")
                       }}
                       className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
                       title="back"
                       >
                          <IoIosArrowBack size={30} />
                     </div>

                     <div>
                        <IconBtn
                          text="Add Review"
                          customClasses="ml-auto"
                          onclick={() => setReviewModal(true)}
                        />
                     </div>
                 </div>
                 {/* for headings or title */}
                 <div className="flex flex-col">
                    <p>{courseEntireData?.courseName}</p>
                    <p className="text-sm font-semibold text-richblack-5">
                     {completedLectures.length || 0} / {totalNoOfLectures || 0}
                    </p>
                 </div>
             </div>

             {/* for sections and subsections */}
             <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
                {
                    courseSectionData.map((section, index) => (
                       <div className="mt-2 cursor-pointer text-sm text-richblack-5"
                       //  onClick={() => setActiveStatus(section?._id)}
                       onClick={() =>
                            setActiveStatus(prev =>
                             prev === section?._id ? "" : section?._id
                          )
                        }
                         key={index}
                        >
                           {/* section */}
                           <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                              <div className="w-[70%] font-semibold">
                                  {section?.sectionName}
                              </div>
                              <div className="flex items-center gap-3">
                               {/* <span className="text-[12px] font-medium">
                                Lession {course?.subSection.length}
                                </span> */}

                                 {/* Add icone here with rotation logic */}
                                 <span className={`${
                                     activeStatus === section?.sectionName
                                        ? "rotate-0"
                                        : "rotate-180"
                                        } transition-all duration-500`}>
                                     <BsChevronDown/>
                                 </span>
                              </div>
                           </div>

                           {/* subSection */}
                           <div>
                               {
                                  activeStatus === section?._id && (
                                     <div className="transition-[height] duration-500 ease-in-out">
                                         {
                                             section?.subSection.map((subSection, index) => (
                                                <div
                                                className={`flex gap-3 px-5 py-2 ${
                                                  videobarActive === subSection._id ? "bg-yellow-200 font-semibold text-richblue-800" :
                                                   "hover:bg-richblack-900"}`}
                                                   key={index}
                                                   onClick={() => {
                                                     navigate(
                                                      `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${subSection._id}`
                                                     )
                                                     setVideoBarActive(subSection._id)
                                                   }}>
                                                    <input
                                                      type='checkbox'
                                                      checked ={completedLectures.includes(subSection?._id)}
                                                      onChange={() => {}}
                                                    />
                                                    <span> {subSection?.title}</span>
                                                </div>
                                             ))
                                         }
                                     </div>
                                  )
                               }
                           </div>
                       </div>
                    ))
                }
             </div>
        </div>
      
    </>
  )
}

export default VideoDetailsSidebar
