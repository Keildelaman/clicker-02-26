/**
 * game-loop.js - requestAnimationFrame Loop
 *
 * Calls every registered system's update(dt) function.
 * dt = seconds since last frame (typically 0.016 at 60fps).
 *
 * @see docs/architecture/architecture.md
 */

const tickSystems = [];
let lastTimestamp = 0;
let running = false;

/**
 * Register a function to be called every frame.
 * @param {Function} updateFn - Called with (dt) in seconds
 */
export function registerTickSystem(updateFn) {
  tickSystems.push(updateFn);
}

export function startLoop() {
  running = true;
  lastTimestamp = performance.now();
  requestAnimationFrame(tick);
}

export function stopLoop() {
  running = false;
}

function tick(timestamp) {
  if (!running) return;

  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  // Cap delta to prevent spiral of death after tab switch
  const cappedDt = Math.min(dt, 0.1);

  for (const update of tickSystems) {
    update(cappedDt);
  }

  requestAnimationFrame(tick);
}
