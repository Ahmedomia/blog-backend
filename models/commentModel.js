const pool = require("../models/db");

exports.createComment = async ({ blogId, userId, text }) => {
  const userResult = await pool.query(
    `SELECT name, profilepic   FROM users WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) throw new Error("User not found");

  const { name: authorName, profilepic: authorpic } = user;

  const result = await pool.query(
    `INSERT INTO comments ("blogId", "userId", "text", "authorname", "authorpic", "createdat")
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [blogId, userId, text, authorName, authorpic]
  );

  return result.rows[0];
};

const getCommentsByBlogId = async (req, res) => {
  const { blogId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.text, c."createdat", u.id as "userId", u.name as authorname, u.profilepic   as authorpic
       FROM comments c
       JOIN users u ON c."userId" = u.id
       WHERE c."blogId" = $1
       ORDER BY c."createdat" DESC`,
      [blogId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};
