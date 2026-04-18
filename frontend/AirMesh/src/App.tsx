import { useState, useEffect, useRef } from "react";
import ReceiverPage from "./components/ReceiverPage";
import SenderPage from "./components/SenderPage";

enum Mode {
  Sender = "SENDER",
  Receiver = "RECEIVER",
}

type Step = "welcome" | "choose" | "app";

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<Mode | null>(null);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // ── Animated blob background ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.3, r: 0.38, color: "#6d28d9", speed: 0.00045, phase: 0 },
      { x: 0.7, y: 0.6, r: 0.35, color: "#1d4ed8", speed: 0.0006, phase: 2 },
      { x: 0.5, y: 0.8, r: 0.32, color: "#0e7490", speed: 0.0005, phase: 4 },
      { x: 0.2, y: 0.7, r: 0.28, color: "#7c3aed", speed: 0.00055, phase: 1 },
      { x: 0.8, y: 0.2, r: 0.3, color: "#1e40af", speed: 0.0004, phase: 3 },
    ];

    const draw = (ts: number) => {
      timeRef.current = ts;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b) => {
        const ox = Math.sin(ts * b.speed + b.phase) * 0.12;
        const oy = Math.cos(ts * b.speed * 0.8 + b.phase) * 0.1;
        const cx = (b.x + ox) * w;
        const cy = (b.y + oy) * h;
        const radius = b.r * Math.min(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, b.color + "55");
        grad.addColorStop(0.5, b.color + "22");
        grad.addColorStop(1, b.color + "00");

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const transitionTo = (nextStep: Step, selectedMode?: Mode) => {
    setExiting(true);
    setTimeout(() => {
      if (selectedMode) setMode(selectedMode);
      setStep(nextStep);
      setExiting(false);
    }, 400);
  };

  const fadeClass = exiting
    ? "opacity-0 translate-y-4 scale-95"
    : "opacity-100";

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Blob canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Frosted noise overlay */}
      <div className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* STEP: Welcome */}
        {step === "welcome" && (
          <div
            className={`text-center space-y-8 transition-all duration-400 ease-out ${fadeClass}`}
          >
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-3xl mb-2 backdrop-blur-sm">
                🌐
              </div>
              <h1 className="text-5xl font-bold tracking-tight">AirMesh</h1>
              <p className="text-zinc-400 text-base max-w-xs mx-auto">
                Fast, local file sharing across your network. No cloud. No fuss.
              </p>
            </div>
            <button
              onClick={() => transitionTo("choose")}
              className="px-8 py-3.5 rounded-2xl bg-white text-zinc-900 font-semibold text-base hover:bg-zinc-100 active:scale-95 transition-all duration-150"
            >
              Get started →
            </button>
          </div>
        )}

        {/* STEP: Choose Mode */}
        {step === "choose" && (
          <div
            className={`text-center space-y-8 transition-all duration-400 ease-out ${fadeClass}`}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                What are you here to do?
              </h2>
              <p className="text-zinc-400 text-sm">You can switch later.</p>
            </div>

            <div className="flex gap-4">
              {/* Sender */}
              <button
                onClick={() => transitionTo("app", Mode.Sender)}
                className="group relative flex flex-col items-center gap-4 px-12 py-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                  📤
                </span>
                <div>
                  <div className="text-white font-semibold text-lg">
                    Sending
                  </div>
                  <div className="text-zinc-500 text-sm mt-0.5">
                    Share files with nearby devices
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
              </button>

              {/* Receiver */}
              <button
                onClick={() => transitionTo("app", Mode.Receiver)}
                className="group relative flex flex-col items-center gap-4 px-12 py-10 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                  📥
                </span>
                <div>
                  <div className="text-white font-semibold text-lg">
                    Receiving
                  </div>
                  <div className="text-zinc-500 text-sm mt-0.5">
                    Accept files from nearby devices
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP: App */}
        {step === "app" && (
          <div
            className={`fixed inset-0 flex flex-col transition-all duration-400 ease-out z-10 pointer-events-none ${fadeClass}`}
          >
            {/* HUD Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex flex-col md:flex-row items-center justify-between z-50 pointer-events-auto">
              <div className="mb-4 md:mb-0 text-center md:text-left drop-shadow-md">
                <h1 className="text-3xl font-bold tracking-tight text-white/90">AirMesh</h1>
                <p className="text-zinc-400 text-sm">Local mesh transfer</p>
              </div>
              
              {/* Mode toggle */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                <button
                  onClick={() => setMode(Mode.Sender)}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    mode === Mode.Sender
                      ? "bg-white text-zinc-900 shadow-md scale-[1.03]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  📤 Sender
                </button>
                <button
                  onClick={() => setMode(Mode.Receiver)}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    mode === Mode.Receiver
                      ? "bg-white text-zinc-900 shadow-md scale-[1.03]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  📥 Receiver
                </button>
              </div>
            </div>

            {/* Page content */}
            <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center pt-24 pb-12 pointer-events-auto">
              {mode === Mode.Sender ? <SenderPage /> : <ReceiverPage />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
