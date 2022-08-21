uniform float time;
uniform float progress;
uniform sampler2D texture;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main(){

    vec3 color = vec3(0.) ;

    float alpha =  vPosition.z*vPosition.z;
    // alpha = pow(vNormal.z,4.);

  gl_FragColor = vec4(color,0.);
}
