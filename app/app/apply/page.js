"use client";

import Link from "next/link";

export default function Home() {
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
        backgroundColor: "rgba(0,0,0,0.5)",
        backgroundBlendMode: "darken",
      }}
    >
      <h1>Simplified Education Hub</h1>

      <div style={{ marginTop: 20 }}>
        <Link href="/apply">
          <button style={{ marginRight: 10 }}>Apply Now</button>
        </Link>

        <Link href="/admin">
          <button>Admin Panel</button>
        </Link>
      </div>
    </div>
  );
}
