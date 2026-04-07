"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Admin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setData(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {data.map((item) => (
        <div key={item.id} style={{ border: "1px solid", margin: 10 }}>
          <p>{item.name}</p>
          <p>{item.email}</p>
          <p>{item.status}</p>
        </div>
      ))}
    </div>
  );
}
