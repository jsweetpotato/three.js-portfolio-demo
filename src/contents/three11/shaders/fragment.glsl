uniform float time;
uniform vec3 pointer;
uniform float progress;
uniform float strong;
uniform sampler2D texture;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;


void main(){

  vec2 direction  = normalize(vPosition.xy - pointer.xy);
  float dist = 1.-length(vPosition - pointer)*2.;
  dist = clamp(dist, 0., 1.);

  vec2 zoomedUV = vUv + direction*dist*progress;
  vec2 zoomedUV1 = mix(vUv,  vec2(0.5), dist*progress);

  vec4 textColor =  texture2D(texture, zoomedUV1);
  gl_FragColor = vec4(zoomedUV1,0.0,1.0);
  gl_FragColor = textColor;
}