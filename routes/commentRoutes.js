const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  addComment,
  getSharedComments,
  getComments,
  reactToComment,
} = require("../controllers/commentController");

router.get("/share/:shareid", getSharedComments);
router.post("/:blogId", authenticate, addComment);
router.get("/:blogId", authenticate, getComments);
router.post("/:commentId/react", authenticate, reactToComment);

module.exports = router;
