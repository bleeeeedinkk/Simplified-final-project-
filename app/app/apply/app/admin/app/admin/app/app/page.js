"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Page() {
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState([]);

  // 🔴 Real-time listener
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setApplications(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  // 📝 Submit
  const submit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "applications"), {
      name,
      email,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setName("");
    setEmail("");
    alert("Submitted!");
  };

  // 🏠 HOME
  if (page === "home") {
    return (
      <div
        style={{
          height: "100vh",
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.6)",
          backgroundBlendMode: "darken",
        }}
      >
        <h1>Simplified Education Hub</h1>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => setPage("apply")}>Apply</button>
          <button onClick={() => setPage("admin")} style={{ marginLeft: 10 }}>
            Admin
          </button>
        </div>
      </div>
    );
  }

  // 📝 APPLY PAGE
  if (page === "apply") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Apply</h1>

        <form onSubmit={submit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br /><br />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <button>Submit</button>
        </form>

        <br />
        <button onClick={() => setPage("home")}>Back</button>
      </div>
    );
  }

  // 🧑‍💻 ADMIN PAGE
  if (page === "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Dashboard</h1>

        {applications.map((app) => (
          <div key={app.id} style={{ border: "1px solid", margin: 10, padding: 10 }}>
            <p>{app.name}</p>
            <p>{app.email}</p>
            <p>{app.status}</p>
          </div>
        ))}

        <button onClick={() => setPage("home")}>Back</button>
      </div>
    );
  }
}
