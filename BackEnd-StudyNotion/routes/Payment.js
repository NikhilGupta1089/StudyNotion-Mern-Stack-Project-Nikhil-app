// Import the required modules
const express = require("express")
const router = express.Router()

// Payment Controllers Import
const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payment")

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")


// ********************************************************************************************************
//                                      Payment routes
// ********************************************************************************************************

/* Payment can Only be Created by Student  */

// TODO: Put IsStudent Middleware here
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail)


// Export Module
module.exports = router