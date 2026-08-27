import "./arch-hero.css";

/* Direction C — THE ARCHITECTURAL, as an interactable hero page (owner's
   brief, 27 Aug). One viewport, no scrolling. The comp's language at full
   size: light systematic ground on a fine drawing grid, spec-sheet
   precision, and the balustrade elevation at centre stage — its floor line,
   posts, rails and infill drawing themselves in like a plot coming off a
   printer, dimensions and figures arriving last. Pure CSS; reduced motion
   lands the finished drawing.

   TRADE ACCURACY (27 Aug review): the drawing is a LEVEL guarding run, not
   a flight — the headline says balustrades, so the elevation must show one.
   Every figure on this page is checkable: handrail 1 100 mm is Part K/BS
   6180 for level guarding, the loading pair is BS 6180's, EXC2 is the
   normal execution class for a balustrade, and UKCA is the GB marking. */

/* geometry in drawing units: 130 units = 3 200 mm run, so 1 unit ≈ 24.6 mm */
const FLOOR = 65;
const TOP_RAIL = 20; // 45 units above the floor = 1 100 mm handrail height
const BOT_RAIL = 57; // kick rail, ~200 mm
const POSTS = [10, 58.75, 107.5, 140]; // 1 200 mm centres, short final bay

/* infill at 110 mm centres: a 100 mm sphere cannot pass between 12 mm bars */
const BALUSTERS = Array.from({ length: 28 }, (_, i) => +(10 + (i + 1) * 4.469).toFixed(2))
  .filter((x) => POSTS.every((p) => Math.abs(x - p) > 1.8));

const FRAME = `M4 ${FLOOR} H150 ` + POSTS.map((x) => `M${x} ${FLOOR} V${TOP_RAIL}`).join(" ");
const RAILS = `M10 ${TOP_RAIL} H140 M10 ${BOT_RAIL} H140`;
const INFILL = BALUSTERS.map((x) => `M${x} ${BOT_RAIL} V${TOP_RAIL}`).join(" ");

export default function ArchHero() {
  return (
    <div className="ah" role="document" aria-label="Wrekin Forge demonstration hero page — Direction C, The Architectural">
      <div className="ah-chrome">
        <span className="ah-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="ah-url">wrekinforge.co.uk</span>
        <span className="ah-demo">DEMONSTRATION</span>
      </div>

      <div className="ah-nav">
        <img
          className="ah-logo"
          src="/images/wrekin-forge-lockup-dark.webp"
          width={1406}
          height={144}
          alt="Wrekin Forge"
        />
        <nav className="ah-links" aria-label="Wrekin Forge demonstration">
          <button type="button">Balustrades</button>
          <button type="button">Staircases</button>
          <button type="button">Specifications</button>
          {/* demoted from a filled button: one primary capture only, and the
              third "spec" on the page went with it */}
          <button type="button" className="ah-navlink">Detail pack (PDF)</button>
        </nav>
      </div>

      <div className="ah-stage">
        <p className="ah-kicker">ARCHITECTURAL METALWORK · TO SPECIFICATION</p>
        <h2 className="ah-display">
          Balustrades, engineered to the <em>millimetre.</em>
        </h2>

        {/* the elevation and its spec sheet read as one drawing sheet: eight
            cells stacked under the drawing overran the one-viewport stage and
            the flex column paid for it by clipping them */}
        <div className="ah-sheet">
        {/* the elevation, plotted: a level guarding run, posts at centres */}
        <svg
          className="ah-draw"
          viewBox="0 0 156 88"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="#161B22">
            <path className="ah-s ah-s1" d={FRAME} strokeWidth="1.1" />
            <path className="ah-s ah-s2" d={RAILS} strokeWidth="1.5" />
            <path className="ah-s ah-s3" d={INFILL} strokeWidth="0.7" />
          </g>
          <g stroke="#29508F" strokeWidth="0.7">
            {/* overall run */}
            <path className="ah-s ah-s4" d="M10 76 H140 M10 73 V79 M140 73 V79 M10 66 V78 M140 66 V78" />
            {/* handrail height, and one bay at post centres */}
            <path className="ah-s ah-s5" d="M147 20 V65 M144 20 H150 M144 65 H150 M10 10 H58.75 M10 7 V13 M58.75 7 V13 M10 19 V9 M58.75 19 V9" />
          </g>
          <g className="ah-dims" fill="#29508F" fontFamily="Martian Mono, ui-monospace, monospace" fontSize="5">
            <text x="75" y="84" textAnchor="middle">3200</text>
            <text x="34.4" y="5.4" textAnchor="middle" fontSize="4">1200 C/C</text>
            <text x="153" y="42.5" textAnchor="middle" fontSize="4" transform="rotate(90 153 42.5)">HANDRAIL 1100</text>
          </g>
        </svg>

        <dl className="ah-specs">
          <div><dt>Material</dt><dd>S275 mild steel, galvanised to BS EN ISO 1461</dd></div>
          <div><dt>Finish</dt><dd>RAL 7016 polyester powder</dd></div>
          <div><dt>Overall run</dt><dd>3 200 mm</dd></div>
          <div><dt>Post centres</dt><dd>1 200 mm max</dd></div>
          <div><dt>Loading</dt><dd>BS 6180 — 0.74 kN/m domestic, 1.5 kN/m assembly</dd></div>
          <div><dt>Fixing</dt><dd>M12 resin anchor</dd></div>
          <div><dt>Lead</dt><dd>6 weeks</dd></div>
          <div><dt>Drawings</dt><dd>Standard details, or drawn to yours</dd></div>
        </dl>
        </div>

        <div className="ah-ctas">
          <button type="button" className="ah-primary">Send your drawings</button>
        </div>

        <div className="ah-chips" aria-hidden="true">
          <span>EN 1090-1 · EXC2 · UKCA</span>
          <span>SITE SURVEYED</span>
          <span>±1 MM ON FABRICATION</span>
        </div>
      </div>

      <p className="ah-foot">
        WREKIN FORGE IS A FICTION — A TALON INSIGHTS DESIGN DEMONSTRATION · DIRECTION C / THE ARCHITECTURAL
      </p>
    </div>
  );
}
