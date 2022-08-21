import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";

import url from "./assets/text.jpg";

export default class THREE11 {
  constructor(canvas) {
    this._container = canvas;

    // renderer setting
    this._renderer = new THREE.WebGL1Renderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._container.appendChild(this._renderer.domElement);

    // create scene
    this._scene = new THREE.Scene();

    // raycast
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // utils
    this._setCamera();
    this._setObject();
    this._setControls();
    this._setting();

    // resize
    this.startevent();

    // rendering
    this.render();
  }

  //

  _setting() {
    this.settings = {
      progress: 0.2,
    };
    const gui = new dat.GUI();
    gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  _setControls() {
    this.controls = new OrbitControls(this._camera, this._container);

    this.controls.target = this.obj.position;
    this.controls.rotateSpeed = 0.5;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
  }

  _setCamera() {
    this._camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    this._camera.position.z = 5;
  }

  _setObject() {
    const geo = new THREE.PlaneBufferGeometry(2, 2);

    this.uniforms = {
      time: { type: "f", value: 1 },
      pointer: { type: "v3", value: new THREE.Vector3() },
      progress: { type: "f", value: 0 },
      texture: { type: "t", value: new THREE.TextureLoader().load(url) },
      resolution: { type: "v4", value: new THREE.Vector4() },
    };

    // for shader
    const mat = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const obj = new THREE.Mesh(geo, mat);
    this.obj = obj;
    this._scene.add(this.obj);
  }

  //

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  startevent() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("pointermove", this.onPointerMove.bind(this));
  }

  stopevent() {
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    window.removeEventListener("pointermove", this.onPointerMove.bind(this));
  }

  // check playing
  stop() {
    this.isPlaying = false;
    stopevent();
  }

  play() {
    if (!this.isPlaying) {
      startevent();
      this.render();
      this.isPlaying = true;
    }
  }
  //
  //

  render() {
    this.raycaster.setFromCamera(this.pointer, this._camera);
    const intersects = this.raycaster.intersectObjects(this._scene.children);

    // shader time update
    this.uniforms.time.value = performance.now();

    this.update();

    if (intersects.length > 0) {
      this.uniforms.pointer.value = intersects[0].point;
      this.uniforms.progress.value = this.settings.progress;
    }

    if (intersects.length < 1) this.uniforms.progress.value = 0;

    this._renderer.render(this._scene, this._camera);
    window.requestAnimationFrame(this.render.bind(this));
  }

  update() {
    this.controls.update();
  }
}
