const pool = require("../models/db");
const { v4: uuidv4 } = require("uuid");

exports.getAllBlogs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const result = await pool.query(
      `
      SELECT 
        blogs.*, 
        users.name AS author, 
        users.email AS authoremail,
        users."profilepic" AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.isdraft = false
      ORDER BY blogs.createdat DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    console.log("Fetched blogs from DB:", result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        blogs.*, 
        users.name AS author, 
        users.email AS authoremail,
        users."profilepic" AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.id = $1
    `,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBlog = async (req, res) => {
  const { title, content, image, category, isdraft } = req.body;
  const authorId = req.user.id;

  try {
    const insertResult = await pool.query(
      "INSERT INTO blogs (title, content, image, category, authorid, createdat, isdraft) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id",
      [title, content, image, category, authorId, isdraft ?? false]
    );

    const newBlogId = insertResult.rows[0].id;

    const result = await pool.query(
      `
      SELECT 
        blogs.*, 
        users.name AS author, 
        users.email AS authoremail,
        users."profilepic" AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.id = $1
      `,
      [newBlogId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  const { title, content, image, isdraft } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE blogs SET title=$1, content=$2, image=$3, isdraft=$4, updatedat=NOW() WHERE id=$5",
      [title, content, image, isdraft, id]
    );

    const result = await pool.query(
      `SELECT 
        blogs.*, 
        users.name AS author, 
        users.email AS authoremail,
        users."profilepic" AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query("SELECT * FROM blogs WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blog = result.rows[0];

    if (blog.authorid !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own blogs" });
    }

    await pool.query("DELETE FROM blogs WHERE id = $1", [id]);

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogsForUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `
      SELECT blogs.*, users.name AS author, users.email AS authoremail, users."profilepic" AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.authorid = $1
      ORDER BY blogs.createdat DESC
      `,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shareBlog = async (req, res) => {
  const blogId = req.params.id;

  try {
    const blogRes = await pool.query(`SELECT * FROM blogs WHERE id = $1`, [
      blogId,
    ]);

    if (blogRes.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let shareId = blogRes.rows[0].shareid;
    if (!shareId) {
      shareId = uuidv4();
    }

    const updateRes = await pool.query(
      `UPDATE blogs
       SET shareid = $1, share_count = share_count + 1
       WHERE id = $2
       RETURNING shareid, share_count`,
      [shareId, blogId]
    );

    const shareLink = `http://localhost:5000/share/${shareId}`;

    res.json({
      message: "Blog shared successfully",
      shareLink,
      shareCount: updateRes.rows[0].share_count,
    });
  } catch (error) {
    console.error("Error sharing blog:", error);
    res.status(500).json({ message: "Error sharing blog" });
  }
};

exports.getSharedBlog = async (req, res) => {
  try {
    const shareId = req.params.shareid;

    const blogResult = await pool.query(
      `
      SELECT 
        blogs.*, 
        users.name AS author, 
        users.email AS authoremail,
        users.profilepic AS authorpic
      FROM blogs
      JOIN users ON blogs.authorid = users.id
      WHERE blogs.shareid = $1
      `,
      [shareId]
    );

    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blog = blogResult.rows[0];

    const commentsResult = await pool.query(
      `
      SELECT 
        comments.*, 
        users.name AS authorName, 
        users."profilepic" AS authorPic
      FROM comments
      JOIN users ON comments."userId" = users.id
      WHERE comments."blogId" = $1
      ORDER BY comments."createdAt" DESC
      `,
      [blog.id]
    );

    blog.comments = commentsResult.rows;

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
