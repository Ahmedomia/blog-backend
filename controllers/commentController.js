const pool = require("../models/db");

const Comment = require("../models/commentModel");

exports.addComment = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { userId, text } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ message: "Missing text or userId" });
    }

    const result = await pool.query(
      `INSERT INTO comments ("blogid", "userid", text, "createdat")
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [blogId, userId, text]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add comment error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getSharedComments = async (req, res) => {
  try {
    const shareId = req.params.shareid;

    const result = await pool.query(
      `
        SELECT 
          c.*,
          u.name AS "authorName",
          u.profilepic AS "authorPic",
          COALESCE(
            json_agg(
              json_build_object(
                'user_id', r.user_id,
                'reaction', r.reaction,
                'username', ru.name
              )
            ) FILTER (WHERE r.id IS NOT NULL), '[]'
          ) AS reactions
        FROM comments c
        JOIN users u ON c."userid" = u.id
        JOIN blogs b ON c."blogid" = b.id
        LEFT JOIN comment_reactions r ON c.id = r.comment_id
        LEFT JOIN users ru ON r.user_id = ru.id
        WHERE b."shareid" = $1
        GROUP BY c.id, u.id, u.name, u.profilepic
        ORDER BY c."createdat" DESC;
      `,
      [shareId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get shared comments error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const blogId = req.params.blogId;

    const { rows } = await pool.query(
      `
      SELECT
        c.id,
        c.blogid      AS "blogId",
        c.userid      AS "userId",
        c.text,
        c.createdat   AS "createdAt",
        u.name        AS "authorName",
        u.profilepic  AS "authorPic",
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', r.user_id,
              'reaction', r.reaction,
              'username', ru.name
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) AS reactions
      FROM comments c
      JOIN users u ON c.userid = u.id
      LEFT JOIN comment_reactions r ON c.id = r.comment_id
      LEFT JOIN users ru ON r.user_id = ru.id
      WHERE c.blogid = $1
      GROUP BY c.id, u.id, u.name, u.profilepic
      ORDER BY c.createdat DESC;
      `,
      [blogId]
    );

    res.json(rows);
  } catch (err) {
    console.error("getComments error:", err);
    res.status(500).json({ message: "Failed to get comments" });
  }
};

exports.reactToComment = async (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const { userId, reaction } = req.body;

  if (!commentId || !userId || !reaction) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    await pool.query(
      `DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    await pool.query(
      `INSERT INTO comment_reactions (comment_id, user_id, reaction) VALUES ($1, $2, $3)`,
      [commentId, userId, reaction]
    );

    const result = await pool.query(
      `SELECT user_id, reaction FROM comment_reactions WHERE comment_id = $1`,
      [commentId]
    );

    res.json({
      reactions: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
};
