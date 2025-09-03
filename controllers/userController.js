const pool = require("../models/db");

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, profilepic, backgroundpic, bio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name=$1, email=$2, profilepic=$3, backgroundpic=$4, bio=$5 
       WHERE id=$6 
       RETURNING *`,
      [name, email, profilepic, backgroundpic, bio, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, profilepic, backgroundpic, bio FROM users"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Failed to fetch users", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, email, profilepic, backgroundpic, bio FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(result);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to fetch user", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateUser,
  getAllUsers,
  getUserById,
};
