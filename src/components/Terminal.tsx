import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X } from "lucide-react";

/**
 * Terminal — a real, keyboard-driven interface into the world.
 *
 * Open with the backtick key (`) or the floating chip in the corner. Commands
 * either print output or fly the camera to a region. It's a parallel path to
 * the NodeMap and the CommandPalette — for visitors who'd rather type than
 * click. Hardcoded, deterministic, no backend.
 */

interface Line {
  kind: "in" | "out" | "sys";
  text: string;
}

const HELP = [
  "available commands:",
  "  help        — this list",
  "  whoami      — identity summary",
  "  about       — go to identity",
  "  projects    — go to projects",
  "  ai          — go to the AI lab",
  "  robotics    — go to the robotics lab",
  "  crypto      — go to cryptography",
  "  journey     — go to the timeline",
  "  contact     — go to contact",
  "  ls          — list regions",
  "  neofetch    — system info",
  "  clear       — clear the screen",
  "  exit        — close the terminal",
];

const REGIONS = [
  "entry       /",
  "identity    /identity",
  "lab         /lab",
  "projects    /projects",
  "crypto      /crypto",
  "robotics    /robotics",
  "journey     /journey",
  "contact     /contact",
];

const NEOFETCH = [
  "        visitor@synaptic",
  "        ----------------",
  "        OS:     Synaptic.OS 1.0",
  "        Shell:  synaptic-sh",
  "        Theme:  cinematic-dark",
  "        CPU:    neural-net @ 60fps",
  "        GPU:    webgl2 / instanced",
  "        Mem:    20 small interactions",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const Terminal = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Line[]>([
    { kind: "sys", text: "synaptic-sh — type `help` for commands" },
  ]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [pastIdx, setPastIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history, open]);

  const print = (lines: string[], kind: Line["kind"] = "out") =>
    setHistory((h) => [...h, ...lines.map((text) => ({ kind, text }))]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    setHistory((h) => [...h, { kind: "in", text: cmd }]);
    if (cmd) {
      setPast((p) => [...p, cmd]);
      setPastIdx(-1);
    }
    const [name, ...args] = cmd.split(/\s+/);
    switch (name.toLowerCase()) {
      case "":
        break;
      case "help":
        print(HELP);
        break;
      case "whoami":
        print([
          "Dikshanta Chapagain",
          "AI · software · robotics · systems",
          "building retrieval-augmented AI, neural nets, and multi-agent systems.",
        ]);
        break;
      case "about":
        print(["→ navigating to identity…"], "sys");
        setTimeout(() => navigate("/identity"), 250);
        break;
      case "projects":
        print(["→ navigating to projects…"], "sys");
        setTimeout(() => navigate("/projects"), 250);
        break;
      case "ai":
      case "lab":
        print(["→ navigating to the AI lab…"], "sys");
        setTimeout(() => navigate("/lab"), 250);
        break;
      case "robotics":
        print(["→ navigating to the robotics lab…"], "sys");
        setTimeout(() => navigate("/robotics"), 250);
        break;
      case "crypto":
        print(["→ navigating to cryptography…"], "sys");
        setTimeout(() => navigate("/crypto"), 250);
        break;
      case "journey":
        print(["→ navigating to the timeline…"], "sys");
        setTimeout(() => navigate("/journey"), 250);
        break;
      case "contact":
        print(["→ navigating to contact…"], "sys");
        setTimeout(() => navigate("/contact"), 250);
        break;
      case "ls":
        print(REGIONS);
        break;
      case "neofetch":
        print(NEOFETCH);
        break;
      case "clear":
        setHistory([]);
        break;
      case "exit":
        onClose();
        break;
      default:
        print([`command not found: ${name} — type \`help\``], "sys");
    }
    void args;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      const idx = pastIdx < 0 ? past.length - 1 : Math.max(0, pastIdx - 1);
      setPastIdx(idx);
      setInput(past[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pastIdx < 0) return;
      const idx = pastIdx + 1;
      if (idx >= past.length) {
        setPastIdx(-1);
        setInput("");
      } else {
        setPastIdx(idx);
        setInput(past[idx]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex h-[60vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/12 bg-[hsl(230_35%_4%)]/95 shadow-2xl"
            initial={{ y: 30, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* title bar */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <TerminalIcon className="h-3.5 w-3.5 text-primary-glow" />
                synaptic-sh
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="close terminal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* scrollback */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed sm:text-[13px]"
            >
              {history.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === "in"
                      ? "text-foreground"
                      : line.kind === "sys"
                        ? "text-primary-glow/70"
                        : "text-muted-foreground"
                  }
                >
                  {line.kind === "in" ? (
                    <>
                      <span className="text-primary-glow/60">visitor@synaptic</span>
                      <span className="text-muted-foreground/50">:~$ </span>
                      {line.text}
                    </>
                  ) : (
                    line.text
                  )}
                </div>
              ))}
              {/* live input line */}
              <div className="mt-0.5 flex items-center">
                <span className="text-primary-glow/60">visitor@synaptic</span>
                <span className="text-muted-foreground/50">:~$&nbsp;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-foreground caret-primary-glow outline-none"
                  aria-label="terminal input"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terminal;
