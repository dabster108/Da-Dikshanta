/**
 * The Lab (§37) — research notes, including the ones that didn't work.
 *
 * These are concept explorations, not shipped systems and not live
 * inference. That framing is deliberate and is carried into the UI: the
 * point is to show the shape of a thing — where a decision boundary sits,
 * what a digest does to one changed byte — not to claim a product.
 *
 * `status` is honest and load-bearing:
 *   live    — interactive here on the page, deterministic
 *   note    — written up, no interactive piece
 *   open    — currently being read, nothing built yet
 */

export type LabStatus = "live" | "note" | "open";

export interface LabNote {
  id: string;
  index: string;
  title: string;
  field: string;
  status: LabStatus;
  /** The note itself — what was tried and what it showed. */
  body: string;
}

export const LAB_NOTES: LabNote[] = [
  {
    id: "boundary",
    index: "001",
    title: "Where the boundary actually sits",
    field: "Machine learning",
    status: "live",
    body: "A classifier's decision boundary is the only part of it worth looking at, and it is the part nobody plots. Drawn directly, it makes overfitting obvious in a way a validation score never does — you can see the model contorting to catch one point.",
  },
  {
    id: "exposure",
    index: "002",
    title: "Everything upstream of the model",
    field: "Computer vision",
    status: "live",
    body: "Half the failures in the X-ray work were not model failures. Exposure, contrast and normalisation decide what the convolution ever gets to see. A preprocessing bug and a bad architecture look identical from the loss curve.",
  },
  {
    id: "forward",
    index: "003",
    title: "A forward pass, slowly",
    field: "Neural networks",
    status: "live",
    body: "Activations rendered layer by layer at human speed. Nothing is being learned here — it is the arithmetic, made watchable. Useful mostly for showing that there is no magic in the middle.",
  },
  {
    id: "avalanche",
    index: "004",
    title: "One byte, and the whole digest moves",
    field: "Cryptography",
    status: "live",
    body: "The avalanche property is easy to state and much more convincing to watch. Change a single character and roughly half the output bits flip. Classical shapes only — a shift cipher, a substitution, a digest, a small-prime RSA round. Educational, deterministic, and not production cryptography.",
  },
  {
    id: "agents",
    index: "005",
    title: "Orchestration, and where it breaks",
    field: "LLM agents",
    status: "open",
    body: "Currently reading rather than building. The interesting failure does not look like a wrong answer — it looks like an agent confidently completing the wrong task and reporting success. Nothing shipped here yet.",
  },
];

/* ---------------------------------------------------------------------------
   Cryptography scene (§38)

   Academic and geometric rather than Matrix-green. The demonstrations below
   are deterministic and educational — the same framing the rest of the Lab
   carries. No production cryptography is claimed or implemented.
   ------------------------------------------------------------------------ */

export interface CipherStage {
  id: string;
  label: string;
  /** Mathematical statement, set in mono. */
  notation: string;
  detail: string;
}

export const CIPHER_STAGES: CipherStage[] = [
  {
    id: "shift",
    label: "Shift",
    notation: "E(x) = (x + k) mod 26",
    detail:
      "The whole idea of a key, in one line. Also the whole idea of a key space too small to matter — twenty-five guesses.",
  },
  {
    id: "substitute",
    label: "Substitute",
    notation: "E(x) = σ(x),  σ ∈ S₂₆",
    detail:
      "A key space of 26! and still broken by counting letters. Size is not strength if the structure survives.",
  },
  {
    id: "digest",
    label: "Digest",
    notation: "H : {0,1}* → {0,1}ⁿ",
    detail:
      "Arbitrary input, fixed output, no way back. Change one bit of input and about half the output bits move.",
  },
  {
    id: "asymmetric",
    label: "Asymmetric",
    notation: "c = mᵉ mod n,  m = c ᵈ mod n",
    detail:
      "Two keys instead of one, resting on the gap between multiplying primes and factoring their product.",
  },
];

/** Small primes used by the RSA-concept illustration. Real RSA uses primes
 *  hundreds of digits long; these are chosen to be followable by hand. */
export const DEMO_PRIMES = [61, 53] as const;
