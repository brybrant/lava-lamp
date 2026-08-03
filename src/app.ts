import * as TWGL from 'twgl.js';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

import GitHubSVG from '@brybrant/svg-icons/GitHub.svg';

const canvas = document.createElement('canvas');
canvas.id = 'background';
document.body.appendChild(canvas);

// Calculate camera position
// based on THREE.Vector3.setFromSphericalCoords(radius, phi, theta)
const DEG_TO_RAD = Math.PI / 180;

const cameraRadius = 6;
const cameraPhi = 90 * DEG_TO_RAD;
const cameraTheta = 270 * DEG_TO_RAD;

const sinPhiRadius = Math.sin(cameraPhi) * cameraRadius;

const cameraPosition = [
  sinPhiRadius * Math.sin(cameraTheta), // X
  Math.cos(cameraPhi) * cameraRadius, // Y
  sinPhiRadius * Math.cos(cameraTheta), // Z
];

const contextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
};

const gl =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  (canvas.getContext('webgl2', contextAttributes) as WebGL2RenderingContext) ||
  (canvas.getContext('webgl', contextAttributes) as WebGLRenderingContext);

const programInfo = TWGL.createProgramInfo(gl, [vertexShader, fragmentShader]);

gl.useProgram(programInfo.program);

const bufferInfo = TWGL.createBufferInfoFromArrays(gl, {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
});

TWGL.setBuffersAndAttributes(gl, programInfo, bufferInfo);

/** Callback for `resize` window event */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

resize();

const startTime = Math.random() * 100;

let frameId = requestAnimationFrame(render);

/**
 * Recursive render function
 * @param time `DOMHighResTimeStamp`
 */
function render(time: DOMHighResTimeStamp) {
  try {
    TWGL.setUniforms(programInfo, {
      uTime: startTime + time * 1e-3,
      uResolution: [window.innerWidth, window.innerHeight],
      uCameraPosition: cameraPosition,
    });
    TWGL.drawBufferInfo(gl, bufferInfo);

    frameId = requestAnimationFrame(render);
  } catch (error) {
    console.error(error);
    cancelAnimationFrame(frameId);
  }
}

document.body.insertAdjacentHTML(
  'beforeend',
  `<main>
    <h1>Lava Lamp</h1>
    <a
      class='button'
      href='https://github.com/brybrant/lava-lamp'
      target='_blank'
    >
      ${GitHubSVG}
    </a>
  </main>`,
);
