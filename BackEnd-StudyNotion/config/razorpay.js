const Razorpay = require("razorpay");

console.log("🔍 Backend key_id:", process.env.RAZORPAY_KEY);
console.log("🔍 Backend secret (first 4 chars):", process.env.RAZORPAY_SECRET?.slice(0,4));


exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});