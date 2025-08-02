import './app.scss';

import * as TWGL from 'twgl.js';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

import GitHubSVG from '@brybrant/svg-icons/GitHub.svg';

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

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('background');

const contextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
};

/** @type {WebGLRenderingContext|WebGL2RenderingContext} */
const gl =
  canvas.getContext('webgl2', contextAttributes) ||
  canvas.getContext('webgl', contextAttributes);

const programInfo = TWGL.createProgramInfo(gl, [vertexShader, fragmentShader]);

gl.useProgram(programInfo.program);

const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};

const bufferInfo = TWGL.createBufferInfoFromArrays(gl, arrays);

TWGL.setBuffersAndAttributes(gl, programInfo, bufferInfo);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

resize();

const startTime = Math.random() * 100;

let frameId = requestAnimationFrame(render);

function render(time) {
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
    return cancelAnimationFrame(frameId);
  }
}

const main = document.createElement('main');

const h1 = document.createElement('h1');
h1.innerText = 'Lava Lamp';
main.appendChild(h1);

const githubLink = document.createElement('a');
githubLink.className = 'button';
githubLink.href = 'https://github.com/brybrant/lava-lamp';
githubLink.target = '_blank';
githubLink.innerHTML = GitHubSVG;
main.appendChild(githubLink);

document.body.appendChild(main);
