uniform sampler2D tDiffuse;
uniform float time;

varying vec4 vUv;

float blendOverlay( float base, float blend ) {

  return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

}

vec3 blendOverlay( vec3 base, vec3 blend ) {

  return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

}

void main() {

  vec4 uv = vUv;

  float X= uv.x * 11. + time;
  float Y= uv.y * 11. + time;
  uv.y += cos(X+Y)*0.1*cos(Y);
  uv.x += sin(X+Y)*0.1*sin(Y);

  vec4 base = texture2DProj( tDiffuse, uv );

  vec3 col = mix( vec3(0.0),blendOverlay( base.rgb, vec3(0.2)),vUv.y*.5);
  gl_FragColor = vec4(col, 1.);

}