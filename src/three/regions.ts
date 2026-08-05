/**
 * The map of the world.
 *
 * The site is one persistent 3D neural network. Each "region" is a location
 * along the master camera curve — a place the camera flies to when the visitor
 * routes there. This table is the single source of truth that the camera rig,
 * the node-map navigation, the command palette, the terminal, and the field
 * log all read from, so adding a region is a one-line change here.
 *
 * `t` is the position on the CatmullRomCurve3 defined in CameraRig, matching
 * the NeuralField's z-depth of +8.5 .. -8.5. The values are spread so that
 * adjacent regions never share a control point (which would make the camera
 * feel like it teleports between them).
 */

export type RegionId =
  | "entry"
  | "identity"
  | "projects"
  | "lab"
  | "robotics"
  | "crypto"
  | "journey"
  | "contact";

export interface Region {
  id: RegionId;
  /** Path in the router. The entry region is the index route. */
  route: string;
  /** Short label shown in the node map. */
  label: string;
  /** One-line description for the command palette and field log. */
  blurb: string;
  /** Camera position along the master curve. */
  t: number;
  /** A two-glyph mark for the node map — not an emoji, a label. */
  mark: string;
  /** System accent token for this region (one of --sys-*). */
  accent: "ai" | "robotics" | "crypto" | "software" | "vr";
}

export const REGIONS: Region[] = [
  {
    id: "entry",
    route: "/",
    label: "Entry",
    blurb: "The whole field, pulled back. Where the network introduces itself.",
    t: 0,
    mark: "EN",
    accent: "ai",
  },
  {
    id: "identity",
    route: "/identity",
    label: "Identity",
    blurb: "Who I am, what I build, how I think — revealed as the camera descends a loss curve.",
    t: 0.13,
    mark: "ID",
    accent: "software",
  },
  {
    id: "projects",
    route: "/projects",
    label: "Projects",
    blurb: "Case studies. Each project is a place in the network with its own silhouette.",
    t: 0.28,
    mark: "PR",
    accent: "ai",
  },
  {
    id: "lab",
    route: "/lab",
    label: "Lab",
    blurb: "Interactive technical concepts. Decision boundaries, pathfinding, neural nets.",
    t: 0.42,
    mark: "LB",
    accent: "ai",
  },
  {
    id: "robotics",
    route: "/robotics",
    label: "Robotics",
    blurb: "A hardcoded perception pipeline — camera, detection, path, retrieval.",
    t: 0.55,
    mark: "RB",
    accent: "robotics",
  },
  {
    id: "crypto",
    route: "/crypto",
    label: "Crypto",
    blurb: "Interactive cryptography — ciphers, hashing, keys. Educational, not production.",
    t: 0.68,
    mark: "CR",
    accent: "crypto",
  },
  {
    id: "journey",
    route: "/journey",
    label: "Journey",
    blurb: "A timeline along the corridor — education and development as a curve.",
    t: 0.82,
    mark: "JR",
    accent: "software",
  },
  {
    id: "contact",
    route: "/contact",
    label: "Contact",
    blurb: "The output cluster. A transmitting beacon. Let's connect.",
    t: 0.95,
    mark: "CO",
    accent: "ai",
  },
];

export const REGION_MAP: Record<RegionId, Region> = REGIONS.reduce(
  (acc, region) => {
    acc[region.id] = region;
    return acc;
  },
  {} as Record<RegionId, Region>,
);

export const regionByRoute = (route: string): Region | undefined =>
  REGIONS.find((r) => r.route === route);

export const regionById = (id: RegionId): Region => REGION_MAP[id];
