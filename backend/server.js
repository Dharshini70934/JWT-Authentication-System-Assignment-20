const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/jwtAuthDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ── User Schema ──
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// ── JWT Verify Middleware ──
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
}

// ── Register API ──
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Login API (JWT Generated) ──
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      "secretkey",
      { expiresIn: '1h' }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Protected Route ──
app.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: "Protected data accessed",
    user: req.user
  });
});

// ── Start Server ──
app.listen(3000, () => console.log('Server running on http://localhost:3000'));