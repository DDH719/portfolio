export default function Card({ title }: { title: string }) {
  return (
    <div
      style={{
        width: 220,
        height: 300,
        borderRadius: 20,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      {title}
      
    </div>
  );
}