const express = require("express");
const {
  updateUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/:id", authenticate, updateUser);
router.get("/:id", authenticate, getUserById);
router.get("/", authenticate, getAllUsers);

module.exports = router;
