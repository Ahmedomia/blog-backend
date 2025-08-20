const express = require("express");
const { updateUser, getAllUsers } = require("../controllers/userController");

const router = express.Router();

router.put("/:id", updateUser);
router.get("/", getAllUsers); 



module.exports = router;
