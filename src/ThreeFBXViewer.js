import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const ThreeFBXViewer = () => {
    const mountRef = useRef(null);
    let mixer;

    useEffect(() => {
        const manager = new THREE.LoadingManager();
        let camera, scene, renderer, stats, controls;
        const clock = new THREE.Clock();
        const params = { asset: 'Samba Dancing' };  // Default asset
        const assets = ['Samba Dancing', 'morph_test'];
        
        const init = () => {
            // Clear any previous content in mountRef to avoid duplicate canvases
            if (mountRef.current) {
                mountRef.current.innerHTML = '';
            }

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            camera.position.set(100, 200, 300);

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xa0a0a0);
            scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

            // Lighting
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
            hemiLight.position.set(0, 200, 0);
            scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 5);
            dirLight.position.set(0, 200, 100);
            dirLight.castShadow = true;
            scene.add(dirLight);

            // Ground
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
            mesh.rotation.x = -Math.PI / 2;
            mesh.receiveShadow = true;
            scene.add(mesh);

            const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
            grid.material.opacity = 0.2;
            grid.material.transparent = true;
            scene.add(grid);

            // Loader
            const loader = new FBXLoader(manager);
            loadAsset(params.asset, loader, scene); // Load the default asset immediately

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;

            // Append renderer element only once
            mountRef.current.appendChild(renderer.domElement);

            // Initialize controls after renderer is mounted
            controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 100, 0);
            controls.update();
            // Disable user interaction
            controls.enableZoom = false;
            controls.enableRotate = false;
            controls.enablePan = false;
            // Stats
            // stats = new Stats();
            // mountRef.current.appendChild(stats.dom);

            // GUI
            // const gui = new GUI();
            // gui.add(params, 'asset', assets).onChange((value) => loadAsset(value, loader, scene));

            // Resize listener
            window.addEventListener('resize', onWindowResize);
        };

        const loadAsset = (asset, loader, scene) => {
            loader.load(`/fbx/${asset}.fbx`, (group) => {
                // Clear previous object
                if (scene.children.some((obj) => obj.type === 'Group')) {
                    scene.remove(scene.children.find((obj) => obj.type === 'Group'));
                }
                const object = group;

                if (object.animations && object.animations.length) {
                    mixer = new THREE.AnimationMixer(object);
                    const action = mixer.clipAction(object.animations[0]);
                    action.play();
                }

                scene.add(object);
            });
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            if (mixer) mixer.update(delta*0.65);

            // controls.update();

            renderer.render(scene, camera);
            // stats.update();
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (renderer) renderer.dispose();
            if (mixer) mixer.uncacheRoot(scene);
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ThreeFBXViewer;
