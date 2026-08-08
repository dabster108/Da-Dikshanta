import { useEffect, useState } from "react";

/**
 * Cryptography demo — type plaintext, watch it encrypt → ciphertext → hash →
 * decrypt back to plaintext. Uses a toy reversible XOR cipher + a simple hash
 * so the demo runs fully client-side; clearly labeled as illustrative.
 */
export const CryptoDemo = () => {
  const [plain, setPlain] = useState("hello, dikshanta");
  const [phase, setPhase] = useState<"idle" | "encrypt" | "hash" | "decrypt">("idle");

  const cipher = xorCipher(plain, "PORTFOLIO-KEY-2026");
  const hash = simpleHash(cipher);

  useEffect(() => {
    setPhase("idle");
    const t1 = setTimeout(() => setPhase("encrypt"), 200);
    const t2 = setTimeout(() => setPhase("hash"), 900);
    const t3 = setTimeout(() => setPhase("decrypt"), 1600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [plain]);

  return (
    <div>
      <label className="label-mono mb-2 block">plaintext</label>
      <input
        value={plain}
        onChange={(e) => setPlain(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary/60"
        placeholder="type a message…"
      />
      <div className="mt-4 space-y-3 font-mono text-xs">
        <Step active={phase === "encrypt"} label="encrypt (XOR)">
          <code className="break-all text-primary">{cipher || "—"}</code>
        </Step>
        <Step active={phase === "hash"} label="hash (SHA-256 · illustrative)">
          <code className="break-all text-primary/80">{hash}</code>
        </Step>
        <Step active={phase === "decrypt"} label="decrypt">
          <code className="break-all text-foreground">{plain || "—"}</code>
        </Step>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">
        illustrative only — not a real cipher
      </p>
    </div>
  );
};

const Step = ({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-lg border px-3 py-2 transition-colors ${
      active ? "border-primary/50 bg-primary/5" : "border-white/10"
    }`}
  >
    <div className="label-mono mb-1">{label}</div>
    <div className="min-h-[1.2em]">{children}</div>
  </div>
);

function xorCipher(text: string, key: string) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += c.toString(16).padStart(2, "0");
  }
  return out;
}

function simpleHash(input: string) {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i++) {
    h1 = Math.imul(h1 ^ input.charCodeAt(i), 0x01000193);
    h2 = Math.imul(h2 + input.charCodeAt(i) * 0x85ebca6b, 0xc2b2ae35);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return hex(h1) + hex(h2) + hex(h1 ^ h2) + hex(h2 ^ h1) + hex(h1 * h2 >>> 0) + hex(h2 - h1 >>> 0) + hex(h1 + h2 >>> 0) + hex(h1);
}
