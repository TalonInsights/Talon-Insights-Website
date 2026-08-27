import { useEffect } from "react";
import "./heritage-hero.css";

/* Direction B — THE HERITAGE, as an interactable hero page (owner's brief,
   27 Aug: "sophisticated pages as I have done for the fire example, in the
   style of the placeholder comps"). One viewport, no scrolling. The comp's
   language carried to full size: warm paper, Fraunces serifs, the drawn
   gate scrollwork — here at centre stage, its strokes DRAWING THEMSELVES
   on entry (stroke-dashoffset keyframes; reduced motion lands the finished
   gate). The Wrekin Forge lockup appears in its dark cut for the paper
   ground. Everything is CSS — no three.js, no timers, nothing persists. */

const FONT_ID = "hh-fonts"; // Fraunces already ships in the site head; this
// component only needs to ensure nothing extra loads. Kept as a marker.

export default function HeritageHero() {
  useEffect(() => {
    // nothing to fetch: Fraunces + Martian Mono ship with the site head
    void FONT_ID;
  }, []);

  return (
    <div className="hh" role="document" aria-label="Wrekin Forge demonstration hero page — Direction B, The Heritage">
      <div className="hh-chrome">
        <span className="hh-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="hh-url">wrekinforge.co.uk</span>
        <span className="hh-demo">DEMONSTRATION</span>
      </div>

      <div className="hh-nav">
        <img
          className="hh-logo"
          src="/images/wrekin-forge-lockup-dark.webp"
          width={1406}
          height={144}
          alt="Wrekin Forge"
        />
        <nav className="hh-links" aria-label="Wrekin Forge demonstration">
          <button type="button">Restoration</button>
          <button type="button">Conservation</button>
          <button type="button">Commissions</button>
        </nav>
        <button type="button" className="hh-navcta">Enquire</button>
      </div>

      <div className="hh-stage">
        <p className="hh-kicker">WREKIN FORGE · SHROPSHIRE · EST. 1998</p>
        <h2 className="hh-display">
          Ironwork for buildings <em>with&nbsp;history.</em>
        </h2>

        {/* the gate, drawn: the comp's scrollwork at centre stage, strokes
            drawing themselves in on arrival */}
        <svg
          className="hh-gate"
          viewBox="0 0 120 54"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          aria-hidden="true"
        >
          <path className="hh-s hh-s1" d="M60 6 V50" />
          <path className="hh-fin hh-f1" d="M60 6 l-3.5 6 h7 z" fill="currentColor" stroke="none" />
          <path className="hh-s hh-s2" d="M30 50 V16 c0 -7 6 -11 12 -9 c5 2 6 9 1 11 c-4 2 -7 -2 -5 -5" />
          <path className="hh-s hh-s3" d="M90 50 V16 c0 -7 -6 -11 -12 -9 c-5 2 -6 9 -1 11 c4 2 7 -2 5 -5" />
          <path className="hh-s hh-s4" d="M30 34 c10 -8 20 -8 30 0 c10 8 20 8 30 0" strokeWidth="0.9" />
          <path className="hh-s hh-s5" d="M12 50 V22 m96 28 V22" strokeWidth="0.9" />
          <path className="hh-fin hh-f2" d="M12 22 l-2.5 4.5 h5 z M108 22 l-2.5 4.5 h5 z" fill="currentColor" stroke="none" />
          <path className="hh-s hh-s6" d="M4 50 H116" />
        </svg>

        <p className="hh-sub">
          Gates, railings and balustrades restored, conserved and commissioned for
          listed buildings — matched to the original ironwork, joint for joint.
        </p>

        <div className="hh-ctas">
          <button type="button" className="hh-primary">Discuss a restoration</button>
          <button type="button" className="hh-ghost">Past commissions</button>
        </div>

        <div className="hh-specs" aria-hidden="true">
          <span>LISTED-BUILDING CONSENT</span>
          <span>TRADITIONAL JOINERY</span>
          <span>WROUGHT, NOT WELDED</span>
        </div>
      </div>

      <p className="hh-foot">
        WREKIN FORGE IS A FICTION — A TALON INSIGHTS DESIGN DEMONSTRATION · DIRECTION B / THE HERITAGE
      </p>
    </div>
  );
}
