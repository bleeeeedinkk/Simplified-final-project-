"use client";

import { useState, useEffect } from "react";
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

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState([]);

  // 📡 REAL-TIME LISTENER
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(data);
    });

    return () => unsubscribe();
  }, []);

  // 📝 SUBMIT FORM
  const handleSubmit = async (e) => {
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

  return (
    <div style={{ padding: 20 }}>
      <h1>Apply Form</h1>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Apply</button>
      </form>

      <hr />

      <h2>Admin Dashboard (Real-Time)</h2>

      {applications.map((app) => (
        <div key={app.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <p><b>Name:</b> {app.name}</p>
          <p><b>Email:</b> {app.email}</p>
          <p><b>Status:</b> {app.status}</p>
        </div>
      ))}
    </div>
  );
}
