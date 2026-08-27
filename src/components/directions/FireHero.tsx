"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import "./fire-hero.css";

/* Direction A — THE FIRE, as an interactable hero page (owner's brief,
   27 Aug): one viewport, no scrolling; the supplied fire-sphere shader
   (21st import #6, dependency: three) restaged as a straight burning
   line across the frame, with the register's text and controls around it.

   The shader's noise/fbm/cutout mechanics are the reference's, verbatim;
   the geometry changed from a normal-mapped sphere to a UV-mapped plane so
   the flames rise off a level seam, and the noise field is stretched
   anisotropically so tongues repeat along the line. The renderer clears to
   the page's own ground colour so UnrealBloom composites without a visible
   canvas rectangle. Hovering COMMISSION A PIECE stokes the fire (speed and
   bloom ease up); reduced motion renders one developed frame and never
   loops. Everything disposes on unmount — the fire burns only while this
   page is open. Wrekin Forge remains a fiction, and says so on the page. */

const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = `
  #define NUM_OCTAVES 5
  uniform vec3 color1;
  uniform vec3 color0;
  uniform float time;
  varying vec2 vUv;

  float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  vec3 rgbcol(float r, float g, float b) { return vec3(r/255.0,g/255.0,b/255.0); }

  float setOpacity(float r, float g, float b) {
    float tone = (r + g + b) / 3.0;
    return tone < 0.99 ? 0.0 : 1.0;
  }

  void main(){
    // mirror v (the composer pipeline flips it): vv = 0 at the band's
    // bottom edge on screen
    float vv = 1.0 - vUv.y;
    float x = vUv.x;

    // the seam arcs: tips raised at either side, lowest dip at the
    // midpoint (the canvas V axis runs opposite to intuition through the
    // composer, so the curve is mirrored here and u measures screen-up
    // height above the rope). Below the rope is empty.
    float seam = 1.0 - (0.12 + 2.0 * (x - 0.5) * (x - 0.5));
    float u = seam - vv;
    if (u < 0.0) { discard; }

    // noise rides in seam-space so the tongues hug the curve
    float nu = u + time*0.0004;
    vec2 p = vec2(x * 24.0, nu * 9.0);
    float n = fbm(p + fbm(p));

    // the reference's cutout mechanic, verbatim in shape: flat bright body,
    // darker rim band at the silhouette — bloom does the rest
    float f = 1.0 - u * 3.0;
    float shapeBack = f + n*f;
    float shapeFront = (f + 0.08) + n*f;
    float aBack = setOpacity(shapeBack, shapeBack, shapeBack);
    float aFront = setOpacity(shapeFront, shapeFront, shapeFront) - aBack;

    vec3 body = rgbcol(color1.r, color1.g, color1.b);
    vec3 rim = rgbcol(color0.r, color0.g, color0.b);
    vec3 col = aFront > 0.0 ? rim : body;
    float alpha = max(aBack, aFront > 0.0 ? 1.0 : 0.0);
    if (alpha <= 0.0) { discard; }
    gl_FragColor = vec4(col, alpha);
  }
`;

const GROUND = 0x12100d; // the page's own dark, so the canvas has no edges
// the reference's own palette — golden base, burnt border; bloom turns the
// pair into the white-hot core and orange rim of the supplied render
const FIRE_BASE: [number, number, number] = [201, 158, 72];
const FIRE_BORDER: [number, number, number] = [74, 30, 0];

function FireLine({ stokedRef }: { stokedRef: React.MutableRefObject<boolean> }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(GROUND, 1);
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.15;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.6;
    composer.addPass(bloomPass);
    // Without this, the composer displays linear values as sRGB: the whole
    // canvas washes brighter than the page (a visible khaki rectangle) and
    // the golden base reads cream. This converts the output properly, so
    // the cleared ground is pixel-identical to the page behind it.
    composer.addPass(new OutputPass());

    const uniforms = {
      time: { value: reduce ? 5200.0 : 0.0 },
      color1: { value: new THREE.Vector3(...FIRE_BASE) },
      color0: { value: new THREE.Vector3(...FIRE_BORDER) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: vert,
      fragmentShader: frag,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const onResize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const start = performance.now();
    let raf = 0;
    let speed = 1;
    let elapsed = 0;
    let last = 0;
    const tick = () => {
      if (!reduce) {
        // hovering the commission button stokes the seam
        const targetSpeed = stokedRef.current ? 2.2 : 1;
        const targetBloom = stokedRef.current ? 1.9 : 1.2;
        speed += (targetSpeed - speed) * 0.06;
        bloomPass.strength += (targetBloom - bloomPass.strength) * 0.06;
        const now = (performance.now() - start) / 1000;
        elapsed += (now - last) * speed;
        last = now;
        uniforms.time.value = elapsed * 1000.0;
      }
      composer.render();
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    tick(); // at least one frame, even where rAF starves

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [stokedRef]);

  return <div ref={mountRef} className="fh-fire" aria-hidden="true" />;
}

export default function FireHero() {
  const stokedRef = useRef(false);

  return (
    <div className="fh" role="document" aria-label="Wrekin Forge demonstration hero page — Direction A, The Fire">
      {/* browser chrome: this is a webpage, and an honest fiction */}
      <div className="fh-chrome">
        <span className="fh-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="fh-url">wrekinforge.co.uk</span>
        <span className="fh-demo">DEMONSTRATION</span>
      </div>

      <div className="fh-nav">
        <span className="fh-word">Wrekin Forge</span>
        <nav className="fh-links" aria-label="Wrekin Forge demonstration">
          <button type="button">Gates</button>
          <button type="button">Railings</button>
          <button type="button">Staircases</button>
        </nav>
        <button type="button" className="fh-navcta">Commission</button>
      </div>

      <div className="fh-stage">
        <p className="fh-kicker">Architectural metalwork · Shropshire</p>
        <h2 className="fh-display">
          Metal, worked <em>by fire.</em>
        </h2>

        <div className="fh-line">
          <FireLine stokedRef={stokedRef} />
        </div>

        <p className="fh-sub">
          Gates, railings and staircases, forged one commission at a time — measured on
          site, made by hand, fitted to the millimetre.
        </p>

        <div className="fh-ctas">
          <button
            type="button"
            className="fh-primary"
            onMouseEnter={() => { stokedRef.current = true; }}
            onMouseLeave={() => { stokedRef.current = false; }}
            onFocus={() => { stokedRef.current = true; }}
            onBlur={() => { stokedRef.current = false; }}
          >
            Commission a piece
          </button>
          <button type="button" className="fh-ghost">The workshop</button>
        </div>

        <div className="fh-specs" aria-hidden="true">
          <span>EST. 1998</span>
          <span>HAND-FORGED</span>
          <span>SITE-MEASURED</span>
          <span>EN 1090</span>
        </div>
      </div>

      <p className="fh-foot">
        WREKIN FORGE IS A FICTION — A TALON INSIGHTS DESIGN DEMONSTRATION · DIRECTION A / THE FIRE
      </p>
    </div>
  );
}
