import { useEffect, useRef, useState } from "react";
interface Peer {
  id: string;
  name: string;
  initials: string;
  color: { bg: string; text: string };
  angle: number;
  distance: number;
}

const COLORS = [
  { bg: "#6d28d9", text: "#ede9fe" },
  { bg: "#1d4ed8", text: "#dbeafe" },
  { bg: "#0e7490", text: "#cffafe" },
  { bg: "#059669", text: "#d1fae5" },
  { bg: "#d97706", text: "#fef3c7" },
];

const MOCK_PEERS: Peer[] = [];

export default function SenderPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef = useRef(0);
  const animRef = useRef(0);
  const [peers, setPeers] = useState<Peer[]>(MOCK_PEERS);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const peersRef = useRef(peers);
  peersRef.current = peers;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const CX = w / 2;
      const CY = h / 2;
      const MAX_R = Math.max(w, h); // Sweep to edges

      ctx.clearRect(0, 0, w, h);

      // Concentric rings
      for (let i = 1; i <= 6; i++) {
        const r = (MAX_R * i) / 6;
        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(99,102,241,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Crosshairs
      ctx.strokeStyle = "rgba(99,102,241,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX, 0);
      ctx.lineTo(CX, h);
      ctx.moveTo(0, CY);
      ctx.lineTo(w, CY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(CX - MAX_R * 0.707, CY - MAX_R * 0.707);
      ctx.lineTo(CX + MAX_R * 0.707, CY + MAX_R * 0.707);
      ctx.moveTo(CX + MAX_R * 0.707, CY - MAX_R * 0.707);
      ctx.lineTo(CX - MAX_R * 0.707, CY + MAX_R * 0.707);
      ctx.stroke();

      // Sweep trail
      const angle = sweepRef.current;
      for (let i = 0; i < 60; i++) {
        const a = angle - (i * Math.PI) / 60;
        const alpha = ((60 - i) / 60) * 0.15;
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, MAX_R, a, a + Math.PI / 60);
        ctx.fillStyle = `rgba(99,220,130,${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(angle) * MAX_R, CY + Math.sin(angle) * MAX_R);
      ctx.strokeStyle = "rgba(99,220,130,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(CX, CY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(99,220,130,0.9)";
      ctx.fill();

      // Peers
      peersRef.current.forEach((peer) => {
        // Visual distance calculation based on screen size
        const innerRadius = Math.min(w, h) * 0.15;
        const outherRadius = Math.min(w, h) * 0.45;
        const r = innerRadius + peer.distance * (outherRadius - innerRadius);
        const px = CX + Math.cos(peer.angle) * r;
        const py = CY + Math.sin(peer.angle) * r;

        // Ping ring
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.strokeStyle = peer.color.bg + "88";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Avatar fill
        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.fillStyle = peer.color.bg;
        ctx.fill();

        // Initials
        ctx.fillStyle = peer.color.text;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(peer.initials, px, py);
      });

      sweepRef.current += 0.025;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);
  // Helper to add a mock peer for testing — call this from console or wire to discovery
  const addMockPeer = () => {
    const color = COLORS[peers.length % COLORS.length];
    const names = [
      "Riya's MacBook",
      "Arjun's iPhone",
      "Dev's iPad",
      "Sneha's PC",
      "Karan's Laptop",
    ];
    const name = names[peers.length % names.length];
    const initials = name.split("'")[0].slice(0, 2).toUpperCase();
    const newPeer: Peer = {
      id: crypto.randomUUID(),
      name,
      initials,
      color,
      angle: Math.random() * Math.PI * 2,
      distance: 0.3 + Math.random() * 0.55,
    };
    setPeers((prev) => [...prev, newPeer]);
  };

  return (
    <div className="flex flex-col items-center gap-6 relative w-full flex-1 justify-end pb-12 pt-16">
      {/* Fullscreen Radar canvas */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ pointerEvents: 'none' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
          onClick={(e) => {
            const canvas = canvasRef.current!;
            const rect = canvas.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const x = e.clientX - rect.left - cx;
            const y = e.clientY - rect.top - cy;
            let hit: Peer | null = null;
            peersRef.current.forEach((peer) => {
              const innerRadius = Math.min(canvas.width, canvas.height) * 0.15;
              const outherRadius = Math.min(canvas.width, canvas.height) * 0.45;
              const r = innerRadius + peer.distance * (outherRadius - innerRadius);
              const px = Math.cos(peer.angle) * r;
              const py = Math.sin(peer.angle) * r;
              if (Math.hypot(x - px, y - py) < 20) hit = peer;
            });
            setSelectedPeer(hit);
          }}
        />
      </div>

      <div className="w-full max-w-md mx-auto space-y-6 px-4 relative z-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase font-mono mt-4">
            scanning local mesh
          </span>
        </div>

        {/* Status */}
        <div className="text-center space-y-1">
          {peers.length === 0 ? (
            <>
              <p className="text-zinc-300 text-sm font-medium">No peers found</p>
              <p className="text-zinc-600 text-xs">
                Devices on the same network will appear on radar
              </p>
            </>
          ) : (
            <>
              <p className="text-zinc-300 text-sm font-medium">
                {peers.length} peer{peers.length > 1 ? "s" : ""} nearby
              </p>
              <p className="text-zinc-600 text-xs">Tap a blip to send files</p>
            </>
          )}
        </div>

        {/* Dev helper — remove when real discovery is wired */}
        <button
          onClick={addMockPeer}
          className="text-xs text-indigo-400/60 hover:text-indigo-400 transition-colors"
        >
          + simulate peer discovery
        </button>

        {/* Peer list */}
        {peers.length > 0 && (
          <div className="w-full space-y-2">
            {peers.map((peer) => (
              <button
                key={peer.id}
                onClick={() => setSelectedPeer(peer)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 ${selectedPeer?.id === peer.id
                    ? "border-white/20 bg-white/10"
                    : "border-white/5 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: peer.color.bg,
                    color: peer.color.text,
                  }}
                >
                  {peer.initials}
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">
                    {peer.name}
                  </div>
                  <div className="text-zinc-500 text-xs">Ready to receive</div>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Send panel */}
        {selectedPeer && (
          <div className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md p-4 space-y-3 shadow-2xl relative z-20">
            <p className="text-sm text-zinc-300">
              Sending to{" "}
              <span
                className="font-medium px-2 py-0.5 rounded shadow-sm text-white"
                style={{ backgroundColor: (selectedPeer as Peer).color.bg }}
              >
                {(selectedPeer as Peer).name}
              </span>
            </p>
            <label className="block w-full border-2 border-dashed border-indigo-500/30 bg-white/5 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400/60 hover:bg-white/10 transition-colors">
              <input type="file" className="hidden" multiple />
              <div className="text-zinc-300 text-sm font-medium">
                Drop files here or click to browse
              </div>
              <div className="text-zinc-500 text-xs mt-1">
                Supports multiples sizes
              </div>
            </label>
            <button className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-400 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20">
              Send files secure
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
