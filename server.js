const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(express.json());

const SECRET = "mysecretkey";
const DB_FILE = "data.json";

// ================== LOAD / SAVE ==================
let data = { users: [], sessions: {} };

if (fs.existsSync(DB_FILE)) {
  data = JSON.parse(fs.readFileSync(DB_FILE));
} else {
  data.users = [
    { id: 1, username: "admin", password: "123", role: "admin" },
    { id: 2, username: "user1", password: "456", role: "user" }
  ];
  data.sessions = {};
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function saveData() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ================== LOGIN ==================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = data.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.status(401).send("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET
  );

  // multi-device sessions
  if (!data.sessions[user.id]) {
    data.sessions[user.id] = [];
  }

  data.sessions[user.id].push(token);
  saveData();

  res.json({ token });
});

// ================== AUTH ==================
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);

    const userSessions = data.sessions[decoded.id] || [];
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

// ================== USER DASHBOARD ==================
app.get("/dashboard", auth, (req, res) => {
  res.json({
    message: `Welcome ${req.userRole} (User ${req.userId})`
  });
});

// ================== ADMIN ==================
app.get("/admin", auth, (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).send("Access denied");
  }

  res.json({
    users: data.users,
    sessions: data.sessions
  });
});

// ================== ADD USER ==================
app.post("/add-user", auth, (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { username, password, role } = req.body;

  const newUser = {
    id: Date.now(),
    username,
    password,
    role
  };

  data.users.push(newUser);
  saveData();

  res.send("User added");
});

// ================== LOGOUT (ONE DEVICE) ==================
app.post("/logout", auth, (req, res) => {
  const token = req.headers.authorization;

  data.sessions[req.userId] =
    (data.sessions[req.userId] || []).filter(t => t !== token);

  saveData();

  res.send("Logged out from this device");
});

// ================== LOGOUT ALL ==================
app.post("/logout-all", auth, (req, res) => {
  data.sessions[req.userId] = [];
  saveData();

  res.send("Logged out from all devices");
});

// ================== START ==================
app.listen(3000, () => {
  console.log("✅ Full system running on http://localhost:3000");
});
