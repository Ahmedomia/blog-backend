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
} = require("../controllers/blogController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/mine", authenticate, getBlogsForUser);

router.get("/", getAllBlogs);

router.get("/:id", getBlogById);
router.get("/share/:shareid", getSharedBlog);

router.post("/:id/share", authenticate, shareBlog);
router.post("/", authenticate, createBlog);
router.put("/:id", authenticate, updateBlog);
router.delete("/:id", authenticate, deleteBlog);

module.exports = router;
