"use client";

import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Apply() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "applications"), {
      name,
      email,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    alert("Applied!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Apply</h1>

      <form onSubmit={submit}>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <br /><br />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br /><br />
        <button>Submit</button>
      </form>
    </div>
  );
}
