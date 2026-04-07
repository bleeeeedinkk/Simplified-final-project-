const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET = "mysecretkey";

// Users (admin + normal user)
const users = [
  { id: 1, username: "admin", password: "123", role: "admin" },
  { id: 2, username: "user1", password: "456", role: "user" }
];

// LOGIN
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

  res.json({ token });
});

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);
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
    users: users
  });
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
