const express = require("express");
const {
  updateUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

const router = express.Router();

router.put("/:id", updateUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers); 



module.exports = router;
