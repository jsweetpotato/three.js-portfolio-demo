import * as THREE from "three";
import * as dat from "dat.gui";
import { $, $$, addHTML } from "../data";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import texture1 from "./assets/disp.png";
import texture2 from "./assets/noise.jpg";
import texture3 from "./assets/noise2.png";
import texture4 from "./assets/noise3.jpg";
import image from "./assets/onepunch.jpg";

import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";

const textures = {
  texture1: new THREE.TextureLoader().load(texture1),
  texture2: new THREE.TextureLoader().load(texture2),
  texture3: new THREE.TextureLoader().load(texture3),
  texture4: new THREE.TextureLoader().load(texture4),
};

export default class THREE10 {
  constructor(canvas, html) {
    addHTML(html);
    this.btns = $$(".btns button");
    this.btns_conatiner = $(".btns");
    this._container = canvas;

    // renderer setting
    this._renderer = new THREE.WebGL1Renderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._container.appendChild(this._renderer.domElement);

    // create scene
    this._scene = new THREE.Scene();

    // utils
    this._setCamera();
    this._setObject();
    this._setControls();
    this._setting();

    // event start
    this.startevent();

    // rendering
    this.render();
  }

  //

  _setting() {
    this.settings = {
      progress: 0.2,
      strong: 1,
    };
    const gui = new dat.GUI();
    gui.add(this.settings, "progress", 0, 1, 0.01);
    gui.add(this.settings, "strong", 0, 10, 1);
  }

  _setControls() {
    this.controls = new OrbitControls(this._camera, this._container);

    this.controls.target = this.obj.position;
    this.controls.rotateSpeed = 0.9;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    // this.controls.autoRotateSpeed = 0.5;
    // this.controls.autoRotate = true;
  }

  _setCamera() {
    this._camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    this._camera.position.z = 10;
  }

  _setObject() {
    const geo = new THREE.PlaneBufferGeometry(4, 4);

    // for shader

    this.uniforms = {
      time: { type: "f", value: 1 },
      progress: { type: "f", value: 0 },
      strong: { type: "f", value: 0 },
      texture: { type: "t", value: new THREE.TextureLoader().load(image) },
      displacement: { type: "t", value: textures.texture1 },
      resolution: { type: "v4", value: new THREE.Vector4() },
    };

    const mat = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const obj = new THREE.Mesh(geo, mat);
    this.obj = obj;
    this._scene.add(this.obj);
  }

  //
  onClickBtn({ target }) {
    if (target.nodeName !== "BUTTON") return;
    this.btns.forEach((btn) => btn.classList.remove("select"));
    this.uniforms.displacement.value = textures[`texture${target.dataset.id}`];
    target.classList.add("select");
  }

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  startevent() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.btns_conatiner.addEventListener("click", this.onClickBtn.bind(this));
  }

  stopevent() {
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    this.btns_conatiner.removeEventListener("click", this.onClickBtn.bind(this));
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

  render() {
    this.update();

    // shader time update
    this.uniforms.time.value = performance.now();
    this.uniforms.progress.value = this.settings.progress;
    this.uniforms.strong.value = this.settings.strong;

    this._renderer.render(this._scene, this._camera);
    window.requestAnimationFrame(this.render.bind(this));
  }

  update() {
    this.controls.update();
  }
}
