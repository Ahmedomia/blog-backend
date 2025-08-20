const express = require("express");
const router = express.Router();
const {
  addComment,
  getSharedComments,
  getComments,
  reactToComment,
} = require("../controllers/commentController");

router.post("/:blogId", addComment);             
router.get("/share/:shareid", getSharedComments);    
router.get("/:blogId", getComments);                 
router.post("/:commentId/react", reactToComment);    

module.exports = router;