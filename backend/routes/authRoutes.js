const express = require("express");
const router = express.Router();

const {
  checkUser,
  register,
  login,
  sendOTP,
  verifyOTP,
  verifyOTPAndRegister,
  verifyOTPAndLogin,
  googleAuth,
} = require("../controllers/authController");

router.post("/check-user", checkUser);
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/verify-register-otp", verifyOTPAndRegister);
router.post("/verify-login-otp", verifyOTPAndLogin);
router.post("/google", googleAuth);

module.exports = router;