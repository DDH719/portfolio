"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";

export default function Scene() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // 🔥 기존 entered 대신 visible 하나로 정리
  const [visible, setVisible] = useState(false);

  const [selected, setSelected] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const targetRot = useRef(0);
  const currentRot = useRef(0);
  const velocity = useRef(0);

  const [rot, setRot] = useState(0);
  const [zoom, setZoom] = useState(1);

  const isFocus = selected !== null;

  // =========================
  // LOADING
  // =========================
  useEffect(() => {
    let p = 0;

    const interval = setInterval(() => {
      p += Math.random() * 10;

      if (p >= 100) {
        p = 100;
        setProgress(100);

        clearInterval(interval);

        setTimeout(() => {
          setLoading(false);

          // 🔥 핵심: “사아악 등장”
          requestAnimationFrame(() => {
            setVisible(true);
          });
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

      targetRot.current += e.deltaY * 0.22;

      setZoom((z) => {
        const next = z - e.deltaY * 0.0012;
        return Math.max(0.7, Math.min(1.6, next));
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
    if (selected !== null) snap();
  }, [selected]);
  

  // =========================
  // LOADING SCREEN
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
        <div style={{ fontSize: 10, letterSpacing: "0.4em", opacity: 0.5 }}>
          LOADING
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 160, height: 2, background: "#eee" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#111",
                transition: "width 0.2s ease",
              }}
            />
          </div>

          <div style={{ fontSize: 10, opacity: 0.4 }}>
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
         setZoom(1);
        snap();
      }}
      style={{
        width: "100vw",
        height: "100vh",
        perspective: "2000px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",

        background:
          "radial-gradient(circle at center, #f7f7f9 0%, #ececf3 70%, #e5e5f0 100%)",

        // 🔥 핵심: 사라졌다가 "사아악 등장"
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(1.03)",
        filter: visible ? "blur(0px)" : "blur(18px)",
        transition: "opacity 1.2s ease, transform 1.4s ease, filter 1.4s ease",
      }}
    >
      {/* WORLD */}
      <div
        style={{
          width: 900,
          height: 450,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `scale(${selected !== null ? 1 : zoom})
          rotateY(${rot}deg)`,
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

                setZoom(1);
                 if (selected === i) {
                   setSelected(null);
                  } else {
                    setSelected(i);
                  }
               
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                opacity: isDim ? 0.12 : 1,
                transition:
                  "transform 0.9s cubic-bezier(.16,1,.3,1), opacity 0.4s",

                transform: isSelected
                  ? `
                    translate(-50%, -50%)
                    rotateY(${-rot}deg)
                    translateZ(650px)
                    scale(1.35)
                  `
                  : `
                    translate(-50%, -50%)
                    rotateY(${angle}deg)
                    translateZ(420px)
                  `,
              }}
            >
              {/* CARD (원본 유지 + 두께만 유지) */}
              <div
                style={{
                  width: 260,
                  height: 160,
                  position: "relative",
                  

                 background: isSelected
  ? "transparent"
  : "linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))",

backdropFilter: isSelected
  ? "none"
  : "blur(10px)",

border: isSelected
  ? "none"
  : "1px solid rgba(255,255,255,0.35)",

                  boxShadow: isSelected
                    ? "0 60px 140px rgba(0,0,0,0.22)"
                    : "0 10px 25px rgba(0,0,0,0.06)",

                  transform: `
  perspective(1000px)
 smoothMouse.current.x
smoothMouse.current.y
  scale(1.01)
`,
willChange: "transform",
transformStyle: "preserve-3d",


                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {/* LIGHT STREAK */}
<div
  style={{
    position: "absolute",
    inset: 0,
    background: `linear-gradient(
      120deg,
      transparent 0%,
      rgba(255,255,255,0.0) 35%,
      rgba(255,255,255,0.6) 50%,
      rgba(255,255,255,0.0) 65%,
      transparent 100%
    )`,
    transform: `translateX(${mouse.x * 30}px) rotate(${rot * 0.02}deg)`,
    opacity: isSelected ? 0 : 0.7,
    mixBlendMode: "screen",
    pointerEvents: "none",
  }}
  
/>{/* REFRACTION DISTORTION */}
<div
  style={{
    position: "absolute",
    inset: 0,
    background: `radial-gradient(
      circle at ${50 + mouse.x * 20}% ${50 + mouse.y * 20}%,
      rgba(255,255,255,0.4),
      rgba(255,255,255,0.1) 30%,
      transparent 70%
    )`,
    mixBlendMode: "overlay",
    transform: `
      scale(1.05)
      rotateX(${mouse.y * -6}deg)
      rotateY(${mouse.x * 6}deg)
    `,
    transition: "transform 0.08s linear",
    pointerEvents: "none",
  }}
/>
                
               <img
  src={p.image}
  alt=""
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",

    filter: isSelected
      ? "none"
      : "brightness(0.92) saturate(0.9)",

    transition: "0.6s ease",
  }}
  
/>
{/* GLASS DISTORTION LAYER */}
<div
  style={{
    position: "absolute",
    inset: 0,

    background: `radial-gradient(
      circle at ${50 + mouse.x * 10}% ${50 + mouse.y * 10}%,
      rgba(255,255,255,0.35),
      rgba(255,255,255,0.1) 40%,
      transparent 70%
    )`,

    mixBlendMode: "overlay",
    pointerEvents: "none",

    transition: "background 0.25s ease-out",
  }}
/>
{/* DEPTH LAYERS (여기에 추가) */}
{!isSelected && (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "translateZ(-20px)",
        background: "rgba(255,255,255,0.25)",
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "translateZ(-80px)",
        background: "rgba(255,255,255,0.18)",
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "translateZ(-120px)",
        background: "rgba(0,0,0,0.08)",
      }}
    />
  </>
)}
{!isSelected && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, rgba(255, 255, 255, 0.44), transparent 35%, transparent 65%, rgba(255,255,255,0.12))",
      pointerEvents: "none",
    }}
  />
)}
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
          fontSize: 12,
          letterSpacing: "0.35em",
          color: "rgba(0, 0, 0, 0.13)",
          fontFamily: "sans-serif",
        }}
      >
        SCROLL / WHEEL • CLICK TO ENTER
      </div>
    </div>
  );
}