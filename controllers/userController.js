const pool = require("../models/db");

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, profilepic } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2, profilepic  =$3 WHERE id=$4 RETURNING *",
      [name, email, profilepic, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, profilepic   FROM users");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Failed to fetch users", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateUser,
  getAllUsers,
};
