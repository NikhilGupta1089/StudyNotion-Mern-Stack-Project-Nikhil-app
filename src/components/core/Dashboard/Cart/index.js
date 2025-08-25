import { useSelector } from "react-redux";
import RenderTotalAmount from "./RenderTotalAmount";
import RenderCartCourses from "./RenderCartCourses";




export default function Cart() {

    const {total, totalItems} = useSelector((state) => state.cart)
    const { paymentLoading } = useSelector((state) => state.course)

  if (paymentLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner"></div>
      </div>
    )


    return (
         <div>
             <h1 className="text-3xl font-medium text-richblack-5 mb-14">Your Cart</h1>
             <p className="border-b border-b-richblack-400 font-semibold text-richblack-400 pb-2">
             { totalItems} Courses in Cart
            </p>

             {
                total > 0 ?
                (
                    <div className="flex flex-col-reverse lg:flex-row gap-x-10 gap-y-6 items-start mt-8">
                        <RenderCartCourses/>
                        <RenderTotalAmount/>
                    </div>
                ) :
                (
                    <p className="text-3xl text-richblack-100 text-center mt-14">
                      Your Cart is Empty
                    </p>
                )
             }
         </div>
    )

}
