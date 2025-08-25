import { toast } from "react-hot-toast"

import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiconnector"
import { studentEndpoints } from "../apis"


const  {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

// Add Script As a Promise
function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}


// Function to Buy Courses
export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");

    try {
          // load the Script
          const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

          if(!res){
            toast.error("RazorPay SDK failed to load. Check your Internet Connection");
            return;
          }

          // Initiate the order
          const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
                                   {courses},
                                   {
                                     Authorization: `Bearer ${token}`,
                                   }
          )

          if(!orderResponse.data.success){
            throw new Error(orderResponse.data.message);
          }

          console.log("OrderResponse:", orderResponse.data.data)

          console.log("Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY); // <-- ADD THIS HERE
          //Create Options
          const options = {
              key: process.env.REACT_APP_RAZORPAY_KEY,
              currency: orderResponse.data.data.currency,
              amount: `${orderResponse.data.data.amount}`,
              order_id: orderResponse.data.data.id,
              name: "StudyNotion",
              description: "Thank You for Purchasing the Course",
              image:rzpLogo,
              prefill: {
                name: `${userDetails.firstName}`,
                email: userDetails.email
              },
              handler: async function(response){
                 // Send Successful wala Mail
                 sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token);
                 // Verify Payment
                 await verifyPayment({...response, courses}, token, navigate, dispatch);
              }

          }

          // Razorpay Dailog open
          const paymentObject = new window.Razorpay(options);
          paymentObject.open(); 
          paymentObject.on("payment.failed", function(response) {
            toast.error("oops, payment failed");
            console.log(response.error)
          })
    }
    catch(error){
        console.log("PAYMENT API ERROR.....", error)
        toast.error("Could Not make Payment")
    }
    toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token){
    try {
          await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
          },{
             Authorization: `Bearer ${token}`
          })
    }
    catch(error){
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}
 
// verify payment
async function verifyPayment(bodyData, token, navigate, dispatch){
    const toastId = toast.loading("Verifying Payment.....")
    dispatch(setPaymentLoading(true));

    try {
         const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
             Authorization: `Bearer ${token}`
         })

         if(!response.data.success){
            throw new Error(response.data.message)
         }

         toast.success("Payment Successful, You are added to the course");
         navigate("/dashboard/enrolled-courses");
         dispatch(resetCart());
    }
    catch(error){
        console.log("PAYMENT VERIFY ERROR.....", error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId)
    dispatch(setPaymentLoading(false))
}