const pool = require("./db");

async function saveRefreshToken(userId, token, expiresAt) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3`,
    [userId, token, expiresAt]
  );
}

async function removeRefreshToken(userId) {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
}

async function findRefreshToken(userId, token) {
  const res = await pool.query(
    "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2",
    [userId, token]
  );
  return res.rows[0];
}

module.exports = { saveRefreshToken, removeRefreshToken, findRefreshToken };
