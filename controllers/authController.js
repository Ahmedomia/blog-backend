const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const transporter = require("../utils/mailer");

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "postmessage",
});

exports.signup = async (req, res) => {
  const { name, email, password, profilepic } = req.body;
  console.log("Signup request body:", req.body);
  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const result = await pool.query(
      `INSERT INTO users (name, email, password, profilepic, is_verified, verification_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, profilepic`,
      [name, email, hashedPassword, profilepic, false, verificationCode]
    );

    await transporter.sendMail({
      from: '"Blog App" <no-reply@blogapp.com>',
      to: email,
      subject: "Verify your Email",
      html: `<p>Welcome, ${name}!</p><p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });

    res.status(201).json({
      message: "Signup successful. Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.is_verified)
      return res.status(400).json({ message: "User already verified" });

    if (user.verification_code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await pool.query(
      "UPDATE users SET is_verified = true, verification_code = NULL WHERE email = $1",
      [email]
    );

    // ✅ Auto-login: create JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Email verified and login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.googleLogin = async (req, res) => {
  const { code } = req.body;
  console.log("Received from frontend:", req.body);

  try {
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user;
    if (userCheck.rows.length > 0) {
      user = userCheck.rows[0];
    } else {
      const newUser = await pool.query(
        "INSERT INTO users (name, email, profilepic, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, picture, "google-oauth"]
      );
      user = newUser.rows[0];
    }

    const myToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token: myToken, user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userRes.rowCount === 0)
      return res.status(404).json({ message: "Email not found" });

    const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_code = $1, reset_code_expires = $2 WHERE email = $3",
      [resetCode, expires, email]
    );

    await transporter.sendMail({
      from: '"Your Blog" <noreply@yourblog.com>',
      to: email,
      subject: "Your Password Reset Code",
      text: `Use this code to reset your password: ${resetCode}`,
    });

    res.status(200).json({ message: "Reset code sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const userRes = await pool.query(
      `SELECT reset_code, reset_code_expires FROM users WHERE email = $1`,
      [email]
    );

    if (userRes.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    const { reset_code, reset_code_expires } = userRes.rows[0];
    if (reset_code !== code || new Date() > reset_code_expires)
      return res.status(400).json({ message: "Invalid or expired code" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password = $1, reset_code = NULL, reset_code_expires = NULL WHERE email = $2`,
      [hashed, email]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const userRes = await pool.query(
      `SELECT reset_code, reset_code_expires FROM users WHERE email = $1`,
      [email]
    );

    if (userRes.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    const { reset_code, reset_code_expires } = userRes.rows[0];
    if (reset_code !== code || new Date() > reset_code_expires)
      return res.status(400).json({ message: "Invalid or expired code" });

    res.status(200).json({ message: "Code verified successfully" });
  } catch (err) {
    console.error("Verify Code Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
