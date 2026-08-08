import type { CSSProperties } from "react";

/**
 * The project mark, presented as a specimen plate.
 *
 * The images in /public/images are 512×512 black pictograms on transparency —
 * marks, not screenshots of the running systems. Two things follow from that,
 * and both are deliberate:
 *
 *  1. They are not cropped into 16:9 "interface" frames. A square glyph in a
 *     widescreen box with object-cover loses its edges and pretends to be a
 *     screenshot of something. It is presented at its own proportions,
 *     centred, in a plate — the way a figure appears in a paper.
 *
 *  2. They are rendered as a CSS mask filled with a palette token rather than
 *     drawn as an <img>. Black artwork on a near-black ground is invisible,
 *     and `filter: invert()` would give pure #FFF, which is the one colour
 *     this design never uses. Masking paints the glyph in --text-2 exactly.
 *
 * They carry no information the surrounding copy doesn't, so they are
 * aria-hidden. Labelling a generic stock pictogram as project evidence would
 * be describing something that isn't there.
 */

interface Props {
  src: string;
  /** Shown bottom-left, in mono. */
  caption?: string;
  /** Plate proportions. Square by default — it suits the artwork. */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  /** Scales the glyph within the plate. */
  size?: string;
}

export const ProjectPlate = ({
  src,
  caption,
  ratio = "4 / 3",
  className = "",
  style,
  size = "44%",
}: Props) => (
  <figure
    className={`relative m-0 overflow-hidden border hairline ${className}`}
    style={{ aspectRatio: ratio, background: "rgb(var(--surface) / 0.55)", ...style }}
  >
    {/* Registration ticks — a plate, not a card. */}
    {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos) => (
      <span
        key={pos}
        aria-hidden="true"
        className={`absolute h-2 w-2 border-l border-t hairline ${pos}`}
        style={{
          transform:
            pos.includes("right") && pos.includes("bottom")
              ? "rotate(180deg)"
              : pos.includes("right")
                ? "rotate(90deg)"
                : pos.includes("bottom")
                  ? "rotate(270deg)"
                  : undefined,
        }}
      />
    ))}

    <span
      aria-hidden="true"
      data-plate-glyph
      className="absolute inset-0 m-auto block"
      style={{
        width: size,
        aspectRatio: "1 / 1",
        backgroundColor: "rgb(var(--text-2))",
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />

    {caption && (
      <figcaption className="t-mono absolute bottom-3 left-3 right-3 truncate">
        {caption}
      </figcaption>
    )}
  </figure>
);
