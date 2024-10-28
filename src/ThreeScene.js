// src/ThreeScene.js
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";

function ThreeScene() {
  const containerRef = useRef();

  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(1, 2, -3);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const stats = Stats();
    containerRef.current.appendChild(stats.dom);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0xcbcbcb }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Load the model and animations
    const loader = new GLTFLoader();
    let mixer;
    loader.load("/Soldier.glb", (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      model.traverse((object) => {
        if (object.isMesh) object.castShadow = true;
      });

      mixer = new THREE.AnimationMixer(model);
      const idleAction = mixer.clipAction(gltf.animations[0]);
      const walkAction = mixer.clipAction(gltf.animations[3]);
      const runAction = mixer.clipAction(gltf.animations[1]);

      idleAction.play();
      walkAction.play();
      runAction.play();
    });

    // Animate the scene
    const clock = new THREE.Clock();
    function animate() {
      const delta = clock.getDelta();
      mixer?.update(delta);

      renderer.render(scene, camera);
      stats.update();
      requestAnimationFrame(animate);
    }
    animate();

    // Clean up on component unmount
    return () => {
      stats.dom.remove();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}

export default ThreeScene;
