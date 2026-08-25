/* TalonFX — the site's shader layer.
   Compiled by tools/ (esbuild) into assets/fx.js; the page loads one static
   file and owns every byte of it. Wraps @paper-design/shaders' ShaderMount
   with the site's conventions:

   - declarative: any element with [data-fx="mesh"] gets a canvas behind
     its content, colours read from data-fx-colors (comma-separated hex)
   - motion is opt-in: nothing animates under prefers-reduced-motion; the
     shader still renders one static frame (speed 0), which also costs no rAF
   - the mount pauses itself off-viewport and on hidden tabs (library
     behaviour), so background GPU cost is zero
   - failure is silent and safe: no WebGL means no canvas, and the section's
     CSS background simply shows - the shader is enhancement, never content */

import {
  ShaderMount,
  meshGradientFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
} from '@paper-design/shaders';

var reduce = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function meshUniforms(colors, opts) {
  return {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_distortion: opts.distortion,
    u_swirl: opts.swirl,
    u_grainMixer: opts.grainMixer,
    u_grainOverlay: opts.grainOverlay,
    u_fit: ShaderFitOptions.cover,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_offsetX: 0,
    u_offsetY: 0,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

function num(el, name, fallback) {
  var v = parseFloat(el.getAttribute(name));
  return isFinite(v) ? v : fallback;
}

function mount(el) {
  var colors = (el.getAttribute('data-fx-colors') || '#0B1F3A,#143560,#1E40AF')
    .split(',').map(function (c) { return c.trim(); }).filter(Boolean);
  var opts = {
    distortion: num(el, 'data-fx-distortion', 0.8),
    swirl: num(el, 'data-fx-swirl', 0.1),
    grainMixer: num(el, 'data-fx-grain', 0),
    grainOverlay: num(el, 'data-fx-grain-overlay', 0),
  };
  var speed = reduce ? 0 : num(el, 'data-fx-speed', 0.12);
  try {
    return new ShaderMount(
      el, meshGradientFragmentShader, meshUniforms(colors, opts),
      undefined, speed, 0,
      /* render sharp on large hi-DPI monitors: allow up to ~4K x 1.5 */
      2, 3840 * 2160 * 2
    );
  } catch (e) {
    return null; /* no WebGL: the CSS background stands in */
  }
}

function init() {
  document.querySelectorAll('[data-fx="mesh"]').forEach(mount);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { mount };
