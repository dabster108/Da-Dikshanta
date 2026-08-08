import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LAB_NOTES, CIPHER_STAGES, type LabStatus } from "@/data/lab";
import { RevealText } from "@/components/typography/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The Lab (§37) + the cryptography scene (§38).
 *
 * Research notes rather than cards — an index you read down, with the note
 * itself opening in place. One of the five is explicitly unfinished, because
 * a lab where everything worked is a portfolio, not a lab.
 *
 * The cryptography scene is academic on purpose: set mathematics, a prime
 * lattice, and one real digest. It computes actual SHA-256 through
 * `crypto.subtle` rather than faking a hash — the avalanche property is only
 * interesting if the numbers are true.
 */

const STATUS_LABEL: Record<LabStatus, string> = {
  live: "interactive",
  note: "written up",
  open: "reading",
};

/* --- Prime lattice: a quiet, genuinely mathematical figure. ------------- */
const usePrimes = (n: number) =>
  useMemo(() => {
    const sieve = new Uint8Array(n + 1).fill(1);
    sieve[0] = sieve[1] = 0;
    for (let i = 2; i * i <= n; i++) {
      if (!sieve[i]) continue;
      for (let j = i * i; j <= n; j += i) sieve[j] = 0;
    }
    return sieve;
  }, [n]);

const PrimeLattice = () => {
  const cols = 24;
  const rows = 16;
  const primes = usePrimes(cols * rows);

  return (
    <svg
      viewBox={`0 0 ${cols * 10} ${rows * 10}`}
      className="w-full"
      role="img"
      aria-label="Lattice of the integers with primes marked"
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const v = r * cols + c;
          const prime = primes[v] === 1;
          return (
            <circle
              key={v}
              cx={c * 10 + 5}
              cy={r * 10 + 5}
              r={prime ? 1.9 : 0.7}
              fill={prime ? "rgb(var(--lime))" : "rgb(var(--text) / 0.2)"}
            />
          );
        }),
      )}
    </svg>
  );
};

/* --- One real digest, and what one changed byte does to it. ------------- */
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

const Avalanche = () => {
  const [text, setText] = useState("intelligent systems");
  const [digest, setDigest] = useState("");
  const [neighbour, setNeighbour] = useState("");
  const [drift, setDrift] = useState(0);

  useEffect(() => {
    let alive = true;
    const enc = new TextEncoder();
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return; // Insecure context — the section degrades to prose.

    const run = async () => {
      // The same input with its last character nudged by one. Everything
      // about the two strings is identical except a single bit-ish change.
      const flipped = text.length
        ? text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) ^ 1)
        : "a";

      const [a, b] = await Promise.all([
        subtle.digest("SHA-256", enc.encode(text)),
        subtle.digest("SHA-256", enc.encode(flipped)),
      ]);
      if (!alive) return;

      const av = new Uint8Array(a);
      const bv = new Uint8Array(b);
      let bits = 0;
      for (let i = 0; i < av.length; i++) {
        let x = av[i] ^ bv[i];
        while (x) {
          bits += x & 1;
          x >>= 1;
        }
      }
      setDigest(toHex(a));
      setNeighbour(toHex(b));
      setDrift((bits / 256) * 100);
    };

    run();
    return () => {
      alive = false;
    };
  }, [text]);

  if (!digest) {
    return (
      <p className="t-body mt-8">
        Change one bit of the input and roughly half the output bits move.
        (The live digest needs a secure context to run.)
      </p>
    );
  }

  return (
    <div className="mt-10">
      <label className="t-mono block" htmlFor="avalanche-input">
        Input
      </label>
      <input
        id="avalanche-input"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 64))}
        className="mt-3 w-full border-b bg-transparent pb-2 font-mono text-[0.95rem] hairline focus:outline-none"
        style={{ color: "rgb(var(--text))" }}
        spellCheck={false}
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="t-mono">SHA-256</p>
          <p className="mt-2 break-all font-mono text-[0.78rem] leading-relaxed text-2">
            {digest}
          </p>
        </div>
        <div>
          <p className="t-mono">One bit changed</p>
          <p className="mt-2 break-all font-mono text-[0.78rem] leading-relaxed">
            {neighbour.split("").map((ch, i) => (
              <span
                key={i}
                style={{
                  color:
                    ch === digest[i] ? "rgb(var(--text-2))" : "rgb(var(--lime))",
                }}
              >
                {ch}
              </span>
            ))}
          </p>
        </div>
      </div>

      <p className="t-mono mt-6">
        <span className="t-mono-lime tabular-nums">{drift.toFixed(1)}%</span> of the
        256 output bits differ
      </p>
    </div>
  );
};

export const Lab = () => {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(LAB_NOTES[0].id);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-lab-row]", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-lab-list]", start: "top 78%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="lab"
      id="lab"
      className="relative px-gutter py-chapter"
      aria-label="The Lab"
    >
      <p className="t-mono">06 — The Lab</p>

      <RevealText as="h2" className="t-chapter mt-8 max-w-[16ch]">
        <span className="block">Things I took</span>
        <span className="serif block" style={{ fontSize: "1.08em" }}>
          apart.
        </span>
      </RevealText>

      <RevealText as="p" className="t-body measure mt-8">
        Small explorations, kept as notes. None of these is a product and none
        is live inference — the point is the shape of the thing: where a
        boundary sits, what one changed byte does to a digest.
      </RevealText>

      {/* Notes */}
      <div data-lab-list className="mt-16 border-t hairline sm:mt-24">
        {LAB_NOTES.map((note) => {
          const isOpen = open === note.id;
          return (
            <div key={note.id} data-lab-row className="border-b hairline">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : note.id)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[3.5rem_1fr_auto] items-baseline gap-x-4 py-6 text-left sm:grid-cols-[5rem_1fr_9rem_auto] sm:gap-x-8 sm:py-8"
              >
                <span className="t-mono t-mono-lime">{note.index}</span>
                <span
                  className="serif text-[clamp(1.35rem,2.8vw,2.15rem)] leading-tight transition-colors"
                  style={{ color: isOpen ? "rgb(var(--text))" : "rgb(var(--text-2))" }}
                >
                  {note.title}
                </span>
                <span className="t-mono hidden sm:block">{note.field}</span>
                <span
                  className="t-mono transition-transform duration-500"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-500 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-4 pb-8 sm:grid-cols-[5rem_1fr] sm:gap-x-8">
                    <span className="t-mono">{STATUS_LABEL[note.status]}</span>
                    <p className="t-body measure">{note.body}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Cryptography scene (§38) --------------------------------- */}
      <div className="mt-28 sm:mt-40">
        <p className="t-mono">06 / 004 — Cryptography</p>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          <div>
            <RevealText as="h3" className="serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.02]">
              Hard to reverse, easy to check.
            </RevealText>

            <p className="t-body mt-8">
              Four classical shapes, in the order they stop being breakable by
              hand. Educational and deterministic — nothing here is production
              cryptography, and none of it should be used as such.
            </p>

            <dl className="mt-12 border-t hairline">
              {CIPHER_STAGES.map((s) => (
                <div key={s.id} className="border-b py-6 hairline">
                  <dt className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[1.05rem]">{s.label}</span>
                    <code
                      className="font-mono text-[0.82rem]"
                      style={{ color: "rgb(var(--warm))" }}
                    >
                      {s.notation}
                    </code>
                  </dt>
                  <dd className="mt-2.5 text-[0.92rem] leading-relaxed text-mute">
                    {s.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="opacity-70">
              <PrimeLattice />
            </div>
            <p className="t-mono mt-4">
              Integers 0–383. Primes marked — the density that asymmetric
              cryptography rests on.
            </p>
            <Avalanche />
          </div>
        </div>
      </div>
    </section>
  );
};
