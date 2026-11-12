import {
  createProgramInfo,
  createBufferInfoFromArrays,
  drawBufferInfo,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js';

import vertexShader from '../glsl/vertex.glsl';
import fragmentShader from '../glsl/fragment.glsl';

import { RAD360 } from './const.ts';

import { createElement } from './dom.ts';

export const canvas = createElement('canvas', { className: 'background' });

const contextAttributes: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
};

const webgl2 = canvas.getContext('webgl2', contextAttributes);

const gl = webgl2 ?? canvas.getContext('webgl', contextAttributes);

if (!gl) throw new Error('WebGL is not supported');

const isWebGL2 = webgl2 !== null;

const PREFIX = isWebGL2 ? '#version 300 es\n' : '';

const programInfo = createProgramInfo(gl, [
  PREFIX + vertexShader,
  PREFIX + fragmentShader,
]);

gl.useProgram(programInfo.program);

const bufferInfo = createBufferInfoFromArrays(gl, {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
});

setBuffersAndAttributes(gl, programInfo, bufferInfo);

// Camera.xyz = [-6.0, 0.0, 0.0];
// Camera facing towards +X

// Sphere.xyz = position; Sphere.w = size;

export const UNIFORMS = Object.seal({
  uLava: new Float32Array(3),
  uFog: new Float32Array(3),
  uSphereMiddle: new Float32Array([0.0, 0.0, 0.0, 1.5]),
  uSphereRight: new Float32Array([-1.0, 0.0, 4.0, 1.5]),
  uSphereLeft: new Float32Array([-1.0, 0.0, -4.0, 1.5]),
  uSphereBackRight: new Float32Array([3.0, 0.0, 2.5, 2.0]),
  uSphereBackLeft: new Float32Array([3.0, 0.0, -2.5, 2.0]),
  uWobble: Math.random() * RAD360,
  uResolution: new Float32Array(2),
});

export const setResolution = (width: number, height: number) => {
  UNIFORMS.uResolution[0] = canvas.width = width;
  UNIFORMS.uResolution[1] = canvas.height = height;

  gl.viewport(0, 0, width, height);
};

export const draw = () => {
  setUniforms(programInfo, UNIFORMS);
  drawBufferInfo(gl, bufferInfo);
};
