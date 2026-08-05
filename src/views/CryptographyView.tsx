import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";
import { useFieldLog } from "@/contexts/FieldLogContext";

/** Cryptography — interactive, educational, deterministic. Not production crypto. */

type Tab = "caesar" | "substitution" | "hash" | "rsa";
const TABS: { id: Tab; label: string }[] = [
  { id: "caesar", label: "Caesar" },
  { id: "substitution", label: "Substitution" },
  { id: "hash", label: "Hashing" },
  { id: "rsa", label: "RSA concept" },
];

const CryptographyView = () => {
  const [tab, setTab] = useState<Tab>("caesar");
  const { markConceptDiscovered } = useFieldLog();
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300/80">06 — Cryptography</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          <ScrambleText text="ENCRYPT. DECRYPT. VERIFY." speed={20} />
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Educational, deterministic demonstrations of the classical shapes — a shift cipher, a substitution, a digest, and a small-prime RSA round. Not production crypto. Type something and watch it transform.
        </p>
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); markConceptDiscovered(`crypto:${t.id}`); }}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${tab === t.id ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-white/12 text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm">
        {tab === "caesar" && <CaesarDemo onDiscover={markConceptDiscovered} />}
        {tab === "substitution" && <SubstitutionDemo onDiscover={markConceptDiscovered} />}
        {tab === "hash" && <HashDemo onDiscover={markConceptDiscovered} />}
        {tab === "rsa" && <RsaDemo onDiscover={markConceptDiscovered} />}
      </div>
    </section>
  );
};

const Field = ({ label, value, tone = "amber" }: { label: string; value: string; tone?: "amber" | "emerald" }) => (
  <div>
    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    <div className={`mt-2 w-full break-all rounded-lg border px-3 py-2.5 font-mono text-sm ${tone === "amber" ? "border-amber-400/20 bg-amber-400/5 text-amber-200" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"}`}>
      {value || "—"}
    </div>
  </div>
);

const Input = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="mt-2 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-amber-400/40"
  />
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-5 border-l-2 border-white/10 pl-3 text-xs leading-relaxed text-muted-foreground/80">{children}</p>
);

/* Caesar */
const CaesarDemo = ({ onDiscover }: { onDiscover: (id: string) => void }) => {
  const [text, setText] = useState("HELLO SYNAPTIC");
  const [shift, setShift] = useState(3);
  const cipher = useMemo(() => text.toUpperCase().split("").map((ch) => /[A-Z]/.test(ch) ? String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65) : ch).join(""), [text, shift]);
  return (
    <div className="p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plaintext</label>
          <Input value={text} onChange={(v) => { setText(v); onDiscover("crypto:caesar"); }} />
        </div>
        <Field label={`Ciphertext · shift ${shift}`} value={cipher} />
      </div>
      <div className="mt-6">
        <input type="range" min={0} max={25} value={shift} onChange={(e) => setShift(Number(e.target.value))} className="w-full accent-amber-400" />
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">
          <span>shift 0</span><span>rot{shift}</span><span>shift 25</span>
        </div>
      </div>
      <Caption>Caesar shifts every letter by a fixed amount. ROT13 is shift = 13 — applying it twice returns the original. Easy to break: only 26 keys exist.</Caption>
    </div>
  );
};

/* Substitution */
const KEYED = "QWERTYUIOPASDFGHJKLZXCVBNM";
const SubstitutionDemo = ({ onDiscover }: { onDiscover: (id: string) => void }) => {
  const [text, setText] = useState("CRYPTOGRAPHY IS FUN");
  const cipher = useMemo(() => text.toUpperCase().split("").map((ch) => /[A-Z]/.test(ch) ? KEYED[ch.charCodeAt(0) - 65] : ch).join(""), [text]);
  return (
    <div className="p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plaintext</label>
          <Input value={text} onChange={(v) => { setText(v); onDiscover("crypto:substitution"); }} />
        </div>
        <Field label="Ciphertext" value={cipher} />
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full font-mono text-[10px]">
          <thead><tr className="text-muted-foreground/60">{Array.from({ length: 26 }, (_, i) => <th key={i} className="px-0.5 pb-1 font-normal">{String.fromCharCode(65 + i)}</th>)}</tr></thead>
          <tbody><tr className="text-amber-200/80">{KEYED.split("").map((c, i) => <td key={i} className="px-0.5 text-center">{c}</td>)}</tr></tbody>
        </table>
      </div>
      <Caption>A monoalphabetic substitution maps every letter to a fixed partner. 26! ≈ 4×10²⁶ keys — too many to brute force, but frequency analysis breaks it: the most common ciphertext letter is usually E.</Caption>
    </div>
  );
};

/* Hash — FNV-1a, illustrative only */
const fnv1a = (str: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
};
const HashDemo = ({ onDiscover }: { onDiscover: (id: string) => void }) => {
  const [text, setText] = useState("the quick brown fox");
  const digest = useMemo(() => fnv1a(text), [text]);
  const bits = useMemo(() => {
    const n = BigInt("0x" + digest);
    return Array.from({ length: 32 }, (_, i) => Number((n >> BigInt(31 - i)) & 1n));
  }, [digest]);
  return (
    <div className="p-6">
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Input</label>
      <Input value={text} onChange={(v) => { setText(v); onDiscover("crypto:hash"); }} />
      <div className="mt-5"><Field label="Digest (FNV-1a · illustrative)" value={digest} /></div>
      <div className="mt-5">
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bit fingerprint</label>
        <div className="mt-2 grid grid-cols-[repeat(32,1fr)] gap-1">
          {bits.map((b, i) => <div key={i} className="aspect-square rounded-sm" style={{ background: b ? "hsl(35 95% 60%)" : "hsl(225 22% 10%)" }} />)}
        </div>
      </div>
      <Caption>A hash is a one-way digest: same input → same output, but output can't reverse to input. Change one letter and the whole fingerprint changes (avalanche). This is FNV-1a for visualization — real systems use SHA-256 or BLAKE3.</Caption>
    </div>
  );
};

/* RSA — toy primes */
const P = 61, Q = 53, N = P * Q, E = 17, D = 2753;
const modPow = (base: number, exp: number, mod: number): number => {
  let r = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp);
  while (e > 0n) { if (e & 1n) r = (r * b) % BigInt(mod); e >>= 1n; b = (b * b) % BigInt(mod); }
  return Number(r);
};
const RsaDemo = ({ onDiscover }: { onDiscover: (id: string) => void }) => {
  const [text, setText] = useState("HI");
  const { cipher, decrypted } = useMemo(() => {
    const enc = text.split("").map((ch) => modPow(ch.charCodeAt(0), E, N));
    const dec = enc.map((c) => String.fromCharCode(modPow(c, D, N))).join("");
    return { cipher: enc.join(" "), decrypted: dec };
  }, [text]);
  return (
    <div className="p-6">
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plaintext (ASCII, max 6 chars)</label>
      <input value={text} maxLength={6} onChange={(e) => { setText(e.target.value); onDiscover("crypto:rsa"); }} className="mt-2 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-amber-400/40" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Ciphertext (m^e mod n)" value={cipher} />
        <Field label="Decrypted (c^d mod n)" value={decrypted} tone="emerald" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px] sm:grid-cols-3">
        {[["p", P], ["q", Q], ["n = p·q", N], ["φ(n)", 3120], ["e (public)", E], ["d (private", D]].map(([k, v]) => (
          <div key={k as string} className="rounded-lg border border-white/8 bg-background/40 px-3 py-2">
            <div className="text-muted-foreground/60">{k}</div><div className="text-foreground">{v}</div>
          </div>
        ))}
      </div>
      <Caption>RSA: encrypt with the public key (e, n), decrypt with the private key (d, n). Security rests on factoring n back into p and q — easy for 3233, infeasible for 2048-bit n. These primes are toys; real RSA uses hundreds of digits.</Caption>
    </div>
  );
};

export default CryptographyView;
