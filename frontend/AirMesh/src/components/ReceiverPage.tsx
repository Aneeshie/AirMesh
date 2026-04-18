import { useState } from "react";

interface IncomingRequest {
  id: string;
  from: string;
  initials: string;
  color: { bg: string; text: string };
  files: { name: string; size: string }[];
}

const MOCK_REQUESTS: IncomingRequest[] = [];

export default function ReceiverPage() {
  const [requests, setRequests] = useState<IncomingRequest[]>(MOCK_REQUESTS);
  const [accepted, setAccepted] = useState<string[]>([]);

  const accept = (id: string) => {
    setAccepted((prev) => [...prev, id]);
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setAccepted((prev) => prev.filter((a) => a !== id));
    }, 2000);
  };

  const decline = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="flex flex-col items-center gap-6 relative w-full h-full max-w-md mx-auto z-10 mt-auto justify-center px-4">
      {/* Fullscreen Beacon Rings */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-indigo-500/10"
            style={{
              width: `${i * 20}vw`,
              height: `${i * 20}vw`,
              minWidth: `${i * 120}px`,
              minHeight: `${i * 120}px`,
              animation: `ping ${2 + i * 0.4}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Center Beacon Orb */}
      <div className="relative z-10 flex items-center justify-center w-24 h-24 mt-4 mb-2">
        <div className="relative z-10 w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(79,70,229,0.4)]">
          <div className="w-6 h-6 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_20px_rgba(129,140,248,0.8)]" />
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-zinc-300 text-sm font-medium">
            Listening for senders
          </p>
        </div>
        <p className="text-zinc-600 text-xs">
          Your device is visible on the local network
        </p>
      </div>

      {/* Incoming requests */}
      {requests.length > 0 && (
        <div className="w-full space-y-3">
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-mono">
            Incoming
          </p>
          {requests.map((req) => (
            <div
              key={req.id}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
            >
              {/* Sender info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: req.color.bg,
                    color: req.color.text,
                  }}
                >
                  {req.initials}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {req.from}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {req.files.length} file{req.files.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* File list */}
              <div className="space-y-1.5">
                {req.files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <span className="text-zinc-300 text-xs font-mono truncate max-w-[180px]">
                      {f.name}
                    </span>
                    <span className="text-zinc-600 text-xs shrink-0 ml-2">
                      {f.size}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {accepted.includes(req.id) ? (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-400 text-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  Receiving...
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => decline(req.id)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-400 text-sm hover:bg-white/5 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => accept(req.id)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 active:scale-[0.98] transition-all"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <p className="text-zinc-700 text-xs text-center">
          No incoming transfers right now
        </p>
      )}

      <style>{`
        @keyframes ping {
          0% { transform: scale(0.7); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
