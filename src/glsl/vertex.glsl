#if __VERSION__ >= 300
#define attribute in
#endif

attribute vec4 position;

void main() {
  gl_Position = position;
}