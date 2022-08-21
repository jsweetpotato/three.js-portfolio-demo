import * as dat from "dat.gui";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";

import fragmentlight from "./shaderslight/fragment.glsl";
import vertexlight from "./shaderslight/vertex.glsl";

import fragmentmirror from "./shadersmirror/fragment.glsl";
import vertexmirror from "./shadersmirror/vertex.glsl";

const tv = require("url:../assets/tv.gltf");
const screen = require("url:../assets/screen.gltf");
const screenLight = require("url:../assets/screenlight2.gltf");

class App {
  constructor() {
    this._container = document.querySelector(".canvas");

    // renderer setting
    this._renderer = new THREE.WebGL1Renderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._container.appendChild(this._renderer.domElement);

    // create scene
    this._scene = new THREE.Scene();

    this.time = 0;
    this.mouse = new THREE.Vector3(0, 0, 1);
    this.center = new THREE.Vector3(0, 0, 0);

    this.isPlaying = true;
    this.uniformsUpdate = false;

    // utils
    this._setCamera();
    this._setLight();
    this._setting();
    this._setManager();
    this._setObject();

    // resize
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));

    // rendering
    this.render();
  }

  //

  _setting() {
    this.settings = {
      progress: 0,
    };
    const gui = new dat.GUI();
    gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  _setLight() {
    const light1 = new THREE.AmbientLight(0x2fafdf, 1);
    this._scene.add(light1);

    const pointLight = new THREE.PointLight(0xfffffff, 1.2, 100);
    pointLight.position.set(5, 4, 10);
    this._scene.add(pointLight);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this._scene.add(pointLightHelper);
  }

  _setCamera() {
    this._camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    this._camera.position.z = 11;
  }

  _setManager() {
    const manager = new THREE.LoadingManager();

    const $progress = document.querySelector("progress");
    const $loading_Div = document.querySelector(".loading");

    manager.onProgress = (_, loaded, total) => {
      $progress.value = (loaded / total) * 100;
    };

    manager.onLoad = () => {
      this.uniformsUpdate = true;
      $loading_Div.classList.add("fade-out");
      $loading_Div.addEventListener("animationend", () => {
        $loading_Div.style.visibility = "hidden";
      });
    };

    this._manager = manager;
  }

  _setObject() {
    const GLTF_LOADER = new GLTFLoader(this._manager);

    this.tv = new THREE.Group();

    this.uniforms = {
      time: { type: "f", value: this.time },
      progress: { type: "f", value: 2 },
      offset: { type: "f", value: 0 },
      resolution: { type: "v4", value: new THREE.Vector4() },
      texture: { type: "t", value: this._videoTexture },
      isVideo: { value: this._isVideo },
    };

    const uniformsmirror = {
      color: { value: null },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      time: { value: this.time },
    };

    this.screenMat = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.screeLightMat = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      uniforms: this.uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: vertexlight,
      fragmentShader: fragmentlight,
    });

    GLTF_LOADER.load(tv, (gltf) => {
      const obj = gltf.scene;
      obj.scale.multiplyScalar(20);
      this.tv.add(obj);
    });

    GLTF_LOADER.load(screen, (gltf) => {
      const obj = gltf.scene;
      obj.traverse((child) => {
        if (child.isMesh) child.material = this.screenMat;
      });
      obj.scale.multiplyScalar(20);
      obj.position.set(0, 0, 0.01);
      this.tv.add(obj);
    });

    GLTF_LOADER.load(screenLight, (gltf) => {
      const obj = gltf.scene;
      obj.traverse((child) => {
        if (child.isMesh) child.material = this.screeLightMat;
      });
      obj.scale.multiplyScalar(18);
      obj.position.set(-0.125, 0.35, -0.05);
      this.tv.add(obj);
    });

    this.tv.position.set(0, -3.1, 0);
    this._scene.add(this.tv);

    this.geometry = new THREE.CircleGeometry(10, 35);
    this.groundMirror = new Reflector(this.geometry, {
      clipBias: 0.01,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      shader: {
        uniforms: uniformsmirror,
        vertexShader: vertexmirror,
        fragmentShader: fragmentmirror,
      },
    });

    this.groundMirror.position.y = -2.7;
    this.groundMirror.rotateX(-Math.PI / 2 + 0.3);
    this._scene.add(this.groundMirror);
  }

  // check playing
  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  //

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }
  onMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();
    this.mouse.x = (event.clientX - window.innerWidth * 0.5) * 0.002;
    this.mouse.y = (event.clientY - window.innerHeight * 0.5) * 0.002;
  }

  //

  render() {
    this._renderer.render(this._scene, this._camera);
    window.requestAnimationFrame(this.render.bind(this));
    this._camera.position.x += (-this.mouse.x - this._camera.position.x) * 0.1;
    this._camera.position.y += (this.mouse.y - this._camera.position.y) * 0.1;
    this._camera.lookAt(this.center);

    // shader time update
    if (this.uniformsUpdate) {
      this.time += 0.05;
      this.uniforms.time.value = this.time;
      this.uniforms.progress.value = this.settings.progress;
      this.groundMirror.material.uniforms.time.value = this.time;
    }
  }
}

window.onload = new App();
