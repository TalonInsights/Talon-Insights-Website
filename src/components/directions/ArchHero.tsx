import "./arch-hero.css";

/* Direction C — THE ARCHITECTURAL, as an interactable hero page (owner's
   brief, 27 Aug). One viewport, no scrolling. The comp's language at full
   size: light systematic ground on a fine drawing grid, spec-sheet
   precision, and the balustrade elevation at centre stage — its stringer,
   balusters and handrail drawing themselves in like a plot coming off a
   printer, dimension lines and figures arriving last. Pure CSS; reduced
   motion lands the finished drawing. */

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
        </nav>
        <button type="button" className="ah-navcta">Request spec pack</button>
      </div>

      <div className="ah-stage">
        <p className="ah-kicker">ARCHITECTURAL METALWORK · TO SPECIFICATION</p>
        <h2 className="ah-display">
          Balustrades, engineered to the <em>millimetre.</em>
        </h2>

        {/* the elevation, plotted: the comp's drawing at centre stage */}
        <svg
          className="ah-draw"
          viewBox="0 0 150 108"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="#161B22" strokeWidth="1.1">
            <path className="ah-s ah-s1" d="M10 96 H50 V82 H82 V68 H114 V54 H140" />
            <path className="ah-s ah-s2" d="M22 96 V64 M38 96 V56 M54 82 V48 M70 82 V40 M86 68 V33 M102 68 V25 M118 54 V17 M132 54 V11" strokeWidth="0.9" />
            <path className="ah-s ah-s3" d="M14 70 L140 5" strokeWidth="1.6" />
          </g>
          <g stroke="#29508F" strokeWidth="0.7">
            <path className="ah-s ah-s4" d="M10 103 H140 M10 100 V106 M140 100 V106" />
            <path className="ah-s ah-s5" d="M146 54 V96 M143 54 H149 M143 96 H149" />
          </g>
          <g className="ah-dims" fill="#29508F" fontFamily="Martian Mono, ui-monospace, monospace" fontSize="5">
            <text x="66" y="101" textAnchor="middle">3200</text>
            <text x="148" y="78" textAnchor="middle" transform="rotate(90 148 78)">RISE 900</text>
          </g>
        </svg>

        <dl className="ah-specs">
          <div><dt>Finish</dt><dd>RAL 7016 powder</dd></div>
          <div><dt>Span</dt><dd>3 200 mm</dd></div>
          <div><dt>Fixing</dt><dd>M12 resin anchor</dd></div>
          <div><dt>Lead</dt><dd>6 weeks</dd></div>
        </dl>

        <div className="ah-ctas">
          <button type="button" className="ah-primary">Send your drawings</button>
          <button type="button" className="ah-ghost">Standard details</button>
        </div>

        <div className="ah-chips" aria-hidden="true">
          <span>EN 1090 / CE</span>
          <span>SITE SURVEYED</span>
          <span>0.5 MM TOLERANCE</span>
        </div>
      </div>

      <p className="ah-foot">
        WREKIN FORGE IS A FICTION — A TALON INSIGHTS DESIGN DEMONSTRATION · DIRECTION C / THE ARCHITECTURAL
      </p>
    </div>
  );
}
