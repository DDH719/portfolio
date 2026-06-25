"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";

export default function Scene() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const targetRot = useRef(0);
  const currentRot = useRef(0);
  const velocity = useRef(0);

  const [rot, setRot] = useState(0);
  const [zoom, setZoom] = useState(1);

  const isFocus = selected !== null;

  // =========================
  // LOADING (RESTORED)
  // =========================
  useEffect(() => {
    let p = 0;

    const interval = setInterval(() => {
      p += Math.random() * 12;

      if (p >= 100) {
        p = 100;
        setProgress(100);

        clearInterval(interval);

        setTimeout(() => {
          setLoading(false);
          requestAnimationFrame(() => setEntered(true));
        }, 500);
      }

      setProgress(p);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // INPUT
  // =========================
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isFocus) return;

      targetRot.current += e.deltaY * 0.2;

      setZoom((z) => {
        const next = z - e.deltaY * 0.0012;
        return Math.max(0.75, Math.min(1.8, next));
      });
    };

    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMove);
    };
  }, [isFocus]);

  // =========================
  // ROTATION LOOP
  // =========================
  useEffect(() => {
    let raf: number;

    const animate = () => {
      const diff = targetRot.current - currentRot.current;

      velocity.current += diff * 0.06;
      velocity.current *= 0.82;

      currentRot.current += velocity.current;

      setRot(currentRot.current);

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  const snap = () => {
    const snapped = Math.round(currentRot.current / 360) * 360;
    currentRot.current = snapped;
    targetRot.current = snapped;
    velocity.current = 0;
  };

  useEffect(() => {
    if (selected !== null) {
      const snapped = Math.round(currentRot.current / 360) * 360;
      currentRot.current = snapped;
      targetRot.current = snapped;
      velocity.current = 0;
    }
  }, [selected]);

  // =========================
  // LOADING SCREEN UI
  // =========================
  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.4em",
              opacity: 0.5,
              marginBottom: 20,
            }}
          >
            LOADING
          </div>

          <div
            style={{
              width: 160,
              height: 2,
              background: "#eee",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#111",
                transition: "width 0.15s ease",
              }}
            />
          </div>

          <div style={{ fontSize: 10, opacity: 0.4, marginTop: 10 }}>
            {Math.floor(progress)}%
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // SCENE
  // =========================
  return (
    <div
      onClick={() => {
        setSelected(null);
        snap();
      }}
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(circle at center, #f7f7f9 0%, #e3e3ea 70%, #cfcfd8 100%)",
        perspective: "2000px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: entered ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {/* WORLD */}
      <div
        style={{
          width: 900,
          height: 450,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `scale(${zoom}) rotateY(${rot}deg)`,
        }}
      >
        {projects.map((p, i) => {
          const angle = (i / projects.length) * 360;
          const isSelected = selected === i;
          const isDim = selected !== null && selected !== i;

          return (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(i);
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                opacity: isDim ? 0.15 : 1,
                transition: "transform 0.9s cubic-bezier(.16,1,.3,1)",
                transform: isSelected
                  ? `
                    translate(-50%, -50%)
                    rotateY(${-rot}deg)
                    translateZ(750px)
                    scale(1.7)
                  `
                  : `
                    translate(-50%, -50%)
                    rotateY(${angle}deg)
                    translateZ(420px)
                  `,
              }}
            >
              {/* GLASS CARD */}
              <div
                style={{
                  width: 260,
                  height: 160,
                  position: "relative",
                  transformStyle: "preserve-3d",

                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(235,235,240,0.6))",

                  border: "1px solid rgba(255,255,255,0.7)",

                  boxShadow: isSelected
                    ? "0 60px 140px rgba(0,0,0,0.2)"
                    : "0 10px 25px rgba(0,0,0,0.06)",

                  transform: isSelected
                    ? "none"
                    : `
                      rotateX(${mouse.y * -10}deg)
                      rotateY(${mouse.x * 10}deg)
                    `,

                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 500,
                    zIndex: 5,
                    position: "relative",
                  }}
                >
                  {p.title}
                </div>

                {/* LIGHT */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at ${
                      50 + mouse.x * 30
                    }% ${50 + mouse.y * 30}%,
                    rgba(255,255,255,0.9),
                    rgba(180,220,255,0.25),
                    transparent 70%)`,
                    mixBlendMode: "screen",
                  }}
                />

                {/* DEPTH */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    boxShadow:
                      "inset 0 12px 30px rgba(255,255,255,0.18), inset 0 -16px 30px rgba(0,0,0,0.12)",
                  }}
                />

                {/* THICKNESS */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "translateZ(-18px)",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.6), rgba(0,0,0,0.15))",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* UI */}
      <div
        style={{
          position: "absolute",
          bottom: 25,
          fontSize: 11,
          letterSpacing: "0.35em",
          color: "rgba(0,0,0,0.5)",
          fontFamily: "sans-serif",
          opacity: entered ? 0.8 : 0,
        }}
      >
        SCROLL / CLICK / FOCUS MODE
      </div>
    </div>
  );
}