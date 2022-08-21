uniform float time;
uniform float progress;
uniform float strong;
uniform sampler2D texture;
uniform sampler2D displacement;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

mat2 rotate2D(float ang){
    return mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
}

void main(){
  vec4 displace = texture2D(displacement, vUv.yx);
  vec2 displace_uv = vUv;
  // displace_uv = vec2(vUv.x + 0.1 * cos(vUv.y*8.+time* 0.01), vUv.y); 
  displace_uv.y = mix(vUv.y, displace.r - 0.2, progress);
  vec4 color = texture2D(texture, displace_uv);

  color.r = texture2D(texture, displace_uv + vec2(0.,strong * 0.005) * progress).r;
  color.g = texture2D(texture, displace_uv + vec2(0.,strong * 0.01) * progress).g;
  color.b = texture2D(texture, displace_uv + vec2(0.,strong * 0.02) * progress).b;

  gl_FragColor =  vec4(color);
}
