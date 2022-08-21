uniform float time;
uniform float progress;
uniform sampler2D texture;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main(){
  vec2 uv = vUv;

  float vinet = length(0.5 - uv); 

  vec3 color =  vec3(abs(sin(time*progress)))+vec3(step(uv.x, 0.5));

  gl_FragColor =  vec4(color,1.0);
}
