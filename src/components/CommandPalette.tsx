import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { REGIONS } from "@/three/regions";
import { PROJECT_ACTIVATIONS } from "@/data/projectActivations";

/**
 * Cmd+K — the keyboard way to jump anywhere in the world.
 *
 * The node map is the always-visible legend; this is the power-user shortcut:
 * regions, individual projects, and (later) lab concepts, all in one fuzzy
 * list. It's the thing that makes a six-region world feel deep instead of
 * shallow — you can teleport to any project case study without first routing
 * to the projects region.
 */
interface CommandEntry {
  id: string;
  label: string;
  hint: string;
  route: string;
  group: "Region" | "Project";
}

const buildEntries = (): CommandEntry[] => {
  const regions: CommandEntry[] = REGIONS.map((r) => ({
    id: `region:${r.id}`,
    label: r.label,
    hint: r.blurb,
    route: r.route,
    group: "Region",
  }));

  const projects: CommandEntry[] = PROJECT_ACTIVATIONS.map((p) => ({
    id: `project:${p.id}`,
    label: p.title,
    hint: `Project case study — ${p.shortName}`,
    route: `/projects/${p.id}`,
    group: "Project",
  }));

  return [...regions, ...projects];
};

const score = (query: string, entry: CommandEntry): number => {
  if (!query) return 0;
  const q = query.toLowerCase();
  const label = entry.label.toLowerCase();
  if (label.startsWith(q)) return 100 - label.length;
  if (label.includes(q)) return 60 - label.indexOf(q);
  if (entry.hint.toLowerCase().includes(q)) return 20;
  return -1;
};

const CommandPalette = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(buildEntries, []);

  const results = useMemo(() => {
    if (!query.trim()) return entries;
    return entries
      .map((e) => ({ e, s: score(query, e) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e);
  }, [query, entries]);

  const run = useCallback(
    (entry: CommandEntry) => {
      setOpen(false);
      setQuery("");
      setActive(0);
      navigate(entry.route);
    },
    [navigate],
  );

  // Global hotkey: Cmd/Ctrl+K toggles; Escape closes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      } else if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the field the moment the palette opens.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setActive(0);
      setQuery("");
    }
  }, [open]);

  // Keep the active row in view as the visitor arrows through results.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const row = list.children[active] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[active];
      if (entry) run(entry);
    }
  };

  return (
    <>
      {/* The little persistent hint, not a button — the palette opens from */}
      {/* anywhere via the keyboard. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto fixed right-3 top-3 z-40 hidden items-center gap-2 rounded-full border border-white/10 bg-background/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground sm:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3 w-3" />
        <span>Jump</span>
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <motion.div
              role="dialog"
              aria-label="Command palette"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-card/90 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Jump to a region, a project, a concept…"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
                {results.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Nothing matches "{query}".
                  </p>
                )}
                {results.map((entry, i) => (
                  <button
                    key={entry.id}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(entry)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-primary-glow/70">
                      {entry.group}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-foreground">
                        {entry.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground/80">
                        {entry.hint}
                      </span>
                    </span>
                    {i === active && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
