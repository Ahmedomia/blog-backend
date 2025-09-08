const express = require("express");
const {
  signup,
  verifyCode,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  refreshToken,
  logout,
} = require("../controllers/authController");
const { updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-verification", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.post("/verify-code", verifyResetCode);
router.put("/users/:id", authMiddleware, updateUser);
router.post("/verify-email", verifyCode);
router.post("/refreshToken", refreshToken);
router.post("/logout", authMiddleware, logout);

module.exports = router;
