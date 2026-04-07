const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET = "mysecretkey";

// Users
const users = [
  { id: 1, username: "admin", password: "123", role: "admin" },
  { id: 2, username: "user1", password: "456", role: "user" }
];

// Store active sessions (multi-device)
const sessions = {}; 
// Example: { userId: [token1, token2] }

// LOGIN (creates new session per device)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.status(401).send("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET
  );

  // Save multiple sessions per user
  if (!sessions[user.id]) {
    sessions[user.id] = [];
  }
  sessions[user.id].push(token);

  res.json({ token });
});

// AUTH (check token exists in sessions)
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);

    // Check if token is still active
    const userSessions = sessions[decoded.id] || [];
    if (!userSessions.includes(token)) {
      return res.status(403).send("Session expired");
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch {
    res.status(403).send("Invalid token");
  }
}

// USER DASHBOARD
app.get("/dashboard", auth, (req, res) => {
  res.json({
    message: `Welcome User ${req.userId}`
  });
});

// ADMIN DASHBOARD
app.get("/admin", auth, (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).send("Access denied");
  }

  res.json({
    message: "Admin Dashboard",
    users: users,
    activeSessions: sessions
  });
});

// LOGOUT (only this device)
app.post("/logout", auth, (req, res) => {
  const token = req.headers.authorization;

  sessions[req.userId] = sessions[req.userId].filter(
    t => t !== token
  );

  res.send("Logged out from this device");
});

// START SERVER
app.listen(3000, () => {
  console.log("Multi-device server running on http://localhost:3000");
});
