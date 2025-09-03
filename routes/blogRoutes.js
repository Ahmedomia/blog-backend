const pool = require("../models/db");
const express = require("express");
const {
  getAllBlogs,
  getBlogsForUser,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  shareBlog,
  getSharedBlog,
  getUserBlogs,
} = require("../controllers/blogController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/share/:shareid", getSharedBlog);

router.get("/mine", authenticate, getBlogsForUser);
router.get("/", authenticate, getAllBlogs);
router.get("/:id", authenticate, getBlogById);
router.get("/user/:id", authenticate, getUserBlogs);

router.post("/",authenticate, createBlog);
router.post("/:id/share", authenticate, shareBlog);
router.put("/:id", authenticate, updateBlog);
router.delete("/:id", authenticate, deleteBlog);

module.exports = router;
