#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

#if __VERSION__ >= 300
out highp vec4 fragmentColor;
#define gl_FragColor fragmentColor
#endif

uniform vec3 uLava;
uniform vec3 uFog;
uniform vec4 uSphereMiddle;
uniform vec4 uSphereRight;
uniform vec4 uSphereLeft;
uniform vec4 uSphereBackRight;
uniform vec4 uSphereBackLeft;
uniform float uWobble;
uniform vec2 uResolution;

const vec3 CAMERA_POSITION = vec3(-6.0, 0.0, 0.0);
// const vec3 LIGHT_DIRECTION = vec3(-1.0, 0.0, 0.0);
const float DITHER_STRENGTH = 4.0;

// Borrowed from "hash without sine" by Dave Hoskins:
// https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 dither(vec3 color) {
  float noise = 1.0 - 2.0 * hash12(gl_FragCoord.xy);

  vec3 shift = DITHER_STRENGTH * vec3(0.5, -0.5, 0.5) / 255.0;

  return color + shift * noise;
}

// Based on this lava lamp raymarch shader by Arrangemonk:
// https://www.shadertoy.com/view/fsKXDm

float opSmoothUnion(float d1, float d2) {
  float h = max(1.0 - abs(d1 - d2), 0.0);
  return min(d1, d2) - 0.25 * h * h;
}

float getSceneDistance(vec3 samplePosition, float sinWobble) {
  float sinX = sin(samplePosition.x * 1.5 + uWobble);
  float sinZ = sin(samplePosition.z * 1.5 + uWobble);

  float wave = 0.1 * (
    sin(samplePosition.z + sinX - sinWobble) +
    sin(samplePosition.x + sinZ - uWobble)
  );

  float botPlaneDistance = samplePosition.y + 2.2 + wave;
  float topPlaneDistance = 2.2 - samplePosition.y + wave;

  vec3 qMiddle = samplePosition - uSphereMiddle.xyz;

  float sphereMiddle = length(qMiddle) - uSphereMiddle.w -
    0.06 * sin(qMiddle.y * 3.0 + uSphereMiddle.y * 4.0);

  vec3 qRight = samplePosition - uSphereRight.xyz;

  float sphereRight = length(qRight) - uSphereRight.w -
    0.06 * sin(qRight.y * 3.0 + uSphereRight.y * 4.5);

  vec3 qLeft = samplePosition - uSphereLeft.xyz;

  float sphereLeft = length(qLeft) - uSphereLeft.w -
    0.06 * sin(qLeft.y * 3.0 + uSphereLeft.y * 4.5);

  vec3 qBackRight = samplePosition - uSphereBackRight.xyz;

  float sphereBackRight = length(qBackRight) - uSphereBackRight.w -
    0.04 * sin(qBackRight.y * 3.0 + uSphereBackRight.y * 4.0);

  vec3 qBackLeft = samplePosition - uSphereBackLeft.xyz;

  float sphereBackLeft = length(qBackLeft) - uSphereBackLeft.w -
    0.04 * sin(qBackLeft.y * 3.0 + uSphereBackLeft.y * 4.0);

  float sceneDistance = opSmoothUnion(botPlaneDistance, topPlaneDistance);
  sceneDistance = opSmoothUnion(sceneDistance, sphereMiddle);
  sceneDistance = opSmoothUnion(sceneDistance, sphereRight);
  sceneDistance = opSmoothUnion(sceneDistance, sphereLeft);
  sceneDistance = opSmoothUnion(sceneDistance, sphereBackRight);
  sceneDistance = opSmoothUnion(sceneDistance, sphereBackLeft);

  return sceneDistance;
}

const int MAX_STEPS = 30;
const float MAX_RAY_DISTANCE = 30.0;
const float RAY_START_DISTANCE = 3.8;
const float SURFACE_EPSILON = 0.001;

float raymarch(vec3 rayDirection, out vec3 rayPosition) {
  float rayDistance = RAY_START_DISTANCE;
  rayPosition = CAMERA_POSITION + rayDirection * rayDistance;

  float sinWobble = sin(uWobble);

  for (int i = 0; i < MAX_STEPS; i++) {
    float stepDistance = getSceneDistance(rayPosition, sinWobble);

    if (stepDistance < SURFACE_EPSILON) break;

    rayDistance += stepDistance;

    rayPosition += rayDirection * stepDistance;

    if (rayDistance > MAX_RAY_DISTANCE) break;
  }

  return rayDistance;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uResolution.xy * 0.5) / uResolution.y;

  vec3 rayDirection = normalize(vec3(1.0, uv.y, uv.x));

  vec3 rayPosition;
  float rayDistance = raymarch(rayDirection, rayPosition);

  // Stylized shading approximation, equivalent to:
  // dot(normalize(-rayPosition), LIGHT_DIRECTION)
  float alignment = rayPosition.x / length(rayPosition);

  float lavaAmount = 0.5 * (1.0 + alignment);

  vec3 color = mix(uLava, uFog, lavaAmount);

  color = dither(color);

  gl_FragColor = vec4(color, 1.0);
}