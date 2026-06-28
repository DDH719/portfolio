"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += Math.random() * 6;

      if (current >= 100) {
        current = 100;
        clearInterval(interval);

        setTimeout(() => {
          setFade(true);
        }, 500);
      }

      setProgress(Math.floor(current));
    }, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        opacity: fade ? 0 : 1,
        transition: "opacity 1s ease",
      }}
    >
      <div
        style={{
          width: "260px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,.9)",
            fontSize: "18px",
            marginBottom: "12px",
            letterSpacing: ".15em",
          }}
        >
          {progress}%
        </div>

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "rgba(255,255,255,.85)",
              transition: "width .2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}