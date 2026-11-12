import { RAD180, RAD360, RAD90 } from './ts/const.ts';
import { draw, setResolution, UNIFORMS } from './ts/gl.ts';
import { targetLava, targetFog, currentLava, currentFog } from './ts/ui.ts';

UNIFORMS.uLava.set(currentLava.rgb);
UNIFORMS.uFog.set(currentFog.rgb);

const TARGET_FPS = 60;
const CALIBRATION_DURATION = 1000;
const MAX_RENDER_SCALE = 1.0;
const MIN_RENDER_SCALE = 0.75;
const RENDER_SCALE_STEP = 0.05;

let renderScale = MAX_RENDER_SCALE;

const resize = () => {
  const bodyWidth = document.body.offsetWidth;
  const bodyHeight = document.body.offsetHeight;

  const width = Math.max(1, Math.round(bodyWidth * renderScale));
  const height = Math.max(1, Math.round(bodyHeight * renderScale));

  setResolution(width, height);
};

window.addEventListener('resize', resize);

resize();

const START_TIME = Math.random() * RAD360;

const COLOR_LERP_RATE = 2e-3;
const FOREGROUND_SPHERE_SPEED = 12e-5;
const BACKGROUND_SPHERE_SPEED = 83e-6;
const WOBBLE_SPEED = 41e-5;

let lastTimestamp: DOMHighResTimeStamp | null = null;

document.addEventListener('visibilitychange', () => {
  lastTimestamp = null;
});

let calibrationTime = 0;
let calibrationFrames = 0;
let calibrated = false;

const render = (timestamp: DOMHighResTimeStamp) => {
  if (document.hidden) {
    lastTimestamp = null;
    frameId = requestAnimationFrame(render);
    return;
  }

  const deltaTime = lastTimestamp === null ? 0 : timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (!calibrated && deltaTime > 0) {
    calibrationTime += deltaTime;
    calibrationFrames++;

    if (calibrationTime >= CALIBRATION_DURATION) {
      const averageFPS = Math.ceil(
        (calibrationFrames * 1000) / calibrationTime,
      );

      console.info(
        `Calibration: ${averageFPS} FPS @`,
        `${renderScale}x resolution`,
      );

      if (averageFPS < TARGET_FPS && renderScale > MIN_RENDER_SCALE) {
        renderScale = Math.max(
          MIN_RENDER_SCALE,
          renderScale - RENDER_SCALE_STEP,
        );

        resize();

        calibrationTime = calibrationFrames = 0;
      } else {
        calibrated = true;
      }
    }
  }

  const sphereTimeForeground = START_TIME + timestamp * FOREGROUND_SPHERE_SPEED;
  const sphereTimeBackground = START_TIME + timestamp * BACKGROUND_SPHERE_SPEED;

  if (!(currentLava.settled && currentFog.settled)) {
    const lerpFactor = 1 - Math.exp(deltaTime * -COLOR_LERP_RATE);

    currentLava.lerp(targetLava, lerpFactor);
    currentFog.lerp(targetFog, lerpFactor);

    UNIFORMS.uLava.set(currentLava.rgb);
    UNIFORMS.uFog.set(currentFog.rgb);
  }

  UNIFORMS.uWobble = (UNIFORMS.uWobble + deltaTime * WOBBLE_SPEED) % RAD360;

  UNIFORMS.uSphereMiddle[1] = Math.sin(sphereTimeForeground + RAD90) * 3;
  UNIFORMS.uSphereMiddle[2] = Math.sin(sphereTimeForeground);

  UNIFORMS.uSphereRight[1] = Math.sin(sphereTimeForeground) * 2;
  UNIFORMS.uSphereRight[2] = 4 + Math.cos(sphereTimeForeground);

  UNIFORMS.uSphereLeft[1] = Math.sin(sphereTimeForeground + RAD180) * 2;
  UNIFORMS.uSphereLeft[2] = -4 - Math.cos(sphereTimeForeground);

  UNIFORMS.uSphereBackRight[1] = Math.sin(sphereTimeBackground) * 2.25;
  UNIFORMS.uSphereBackRight[2] = 2.5 - Math.cos(sphereTimeBackground);

  UNIFORMS.uSphereBackLeft[1] = Math.sin(sphereTimeBackground + RAD180) * 2.25;
  UNIFORMS.uSphereBackLeft[2] = -2.5 + Math.cos(sphereTimeBackground + RAD180);

  try {
    draw();

    frameId = requestAnimationFrame(render);
  } catch (error) {
    console.error(error);
    cancelAnimationFrame(frameId);
  }
};

let frameId = requestAnimationFrame(render);
