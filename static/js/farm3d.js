// ==============================================================
// RYTHU MITRA AI (రైతు మిత్ర AI) — 3D FARM DIGITAL TWIN
// Interactive Three.js WebGL Smart Farm Visualizer
// ==============================================================

class Farm3DVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Environment states
    this.isNight = false;
    this.isRaining = false;
    this.isDroneSurvey = false;
    this.drone = null;
    this.dronePropellers = [];
    this.rainParticles = null;
    this.rainGeo = null;
    this.sensorPins = [];
    this.cropSectors = [];
    this.sprinklerParticles = [];

    // Lighting
    this.sunLight = null;
    this.hemiLight = null;
    this.ambientLight = null;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 520;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06150e);
    this.scene.fog = new THREE.FogExp2(0x06150e, 0.008);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.set(45, 40, 55);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.1;
      this.controls.minDistance = 15;
      this.controls.maxDistance = 120;
      this.controls.target.set(0, 2, 0);
    }

    // 5. Lights
    this.setupLighting();

    // 6. Build Farm Terrain & Sectors
    this.createFarmland();

    // 7. Add Drone
    this.createDrone();

    // 8. Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));

    // 9. Animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xd1fae5, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xa7f3d0, 0x064e3b, 0.5);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    this.sunLight.position.set(50, 70, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 200;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);
  }

  createFarmland() {
    // Base soil ground
    const baseGeo = new THREE.BoxGeometry(84, 2, 84);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x2b1d0c, // rich dark brown agricultural soil
      roughness: 0.9,
      metalness: 0.1
    });
    const baseGround = new THREE.Mesh(baseGeo, baseMat);
    baseGround.position.y = -1;
    baseGround.receiveShadow = true;
    this.scene.add(baseGround);

    // 4 Crop Sectors
    const sectorConfig = [
      { id: "sec-1", name: "Paddy (వరి)", x: -21, z: -21, color: 0x10b981, crop: "rice" },
      { id: "sec-2", name: "Cotton (పత్తి)", x: 21, z: -21, color: 0x059669, crop: "cotton" },
      { id: "sec-3", name: "Red Chilli (మిరప)", x: -21, z: 21, color: 0x047857, crop: "chilli" },
      { id: "sec-4", name: "Maize & Groundnut", x: 21, z: 21, color: 0x15803d, crop: "maize" }
    ];

    sectorConfig.forEach((sec) => {
      const fieldGeo = new THREE.BoxGeometry(38, 0.6, 38);
      const fieldMat = new THREE.MeshStandardMaterial({
        color: sec.color,
        roughness: 0.8,
        metalness: 0.05
      });
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      field.position.set(sec.x, 0.3, sec.z);
      field.receiveShadow = true;
      field.userData = { sectorId: sec.id, sectorName: sec.name };
      this.scene.add(field);
      this.cropSectors.push(field);

      // Populate 3D plants in sector
      this.populateCrops(sec.x, sec.z, sec.crop);

      // Add IoT Beacon Pin
      this.createSensorPin(sec.x, 0.8, sec.z, sec.id, sec.name);
    });

    // Central tractor pathway & irrigation canals
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x573e27, roughness: 1.0 });
    const hPath = new THREE.Mesh(new THREE.BoxGeometry(84, 0.4, 4), pathMat);
    hPath.position.y = 0.2;
    this.scene.add(hPath);

    const vPath = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 84), pathMat);
    vPath.position.y = 0.2;
    this.scene.add(vPath);

    // Central Farm Borewell Pump House
    const pumpGeo = new THREE.BoxGeometry(4, 3, 4);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const pumpHouse = new THREE.Mesh(pumpGeo, pumpMat);
    pumpHouse.position.set(0, 1.5, 0);
    pumpHouse.castShadow = true;
    this.scene.add(pumpHouse);

    // Boundary low-poly palm & neem trees
    this.addPerimeterTrees();
  }

  populateCrops(centerX, centerZ, cropType) {
    const group = new THREE.Group();
    const rows = 5;
    const cols = 5;
    const spacing = 6;

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const px = centerX + (c * spacing);
        const pz = centerZ + (r * spacing);

        if (cropType === "rice") {
          // Lush green Paddy tufts
          const stalkGeo = new THREE.ConeGeometry(0.8, 2.2, 5);
          const stalkMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.7 });
          const stalk = new THREE.Mesh(stalkGeo, stalkMat);
          stalk.position.set(px, 1.1, pz);
          stalk.castShadow = true;
          group.add(stalk);
        } else if (cropType === "cotton") {
          // Cotton bush with white bolls
          const bushGeo = new THREE.DodecahedronGeometry(1.0);
          const bushMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });
          const bush = new THREE.Mesh(bushGeo, bushMat);
          bush.position.set(px, 1.0, pz);
          bush.castShadow = true;
          group.add(bush);

          // White cotton boll
          const bollGeo = new THREE.SphereGeometry(0.35, 6, 6);
          const bollMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const boll = new THREE.Mesh(bollGeo, bollMat);
          boll.position.set(px, 1.9, pz);
          group.add(boll);
        } else if (cropType === "chilli") {
          // Chilli bush with red chillies
          const bushGeo = new THREE.CylinderGeometry(0.3, 0.9, 1.8, 5);
          const bushMat = new THREE.MeshStandardMaterial({ color: 0x047857 });
          const bush = new THREE.Mesh(bushGeo, bushMat);
          bush.position.set(px, 0.9, pz);
          group.add(bush);

          // Red chilli pods
          const chilliGeo = new THREE.ConeGeometry(0.2, 0.8, 4);
          const chilliMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
          const chilli = new THREE.Mesh(chilliGeo, chilliMat);
          chilli.rotation.x = Math.PI;
          chilli.position.set(px + 0.3, 1.4, pz);
          group.add(chilli);
        } else {
          // Tall Maize stalk with golden cob
          const stalkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.2, 5);
          const stalkMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
          const stalk = new THREE.Mesh(stalkGeo, stalkMat);
          stalk.position.set(px, 1.6, pz);
          group.add(stalk);

          // Golden corn cob
          const cobGeo = new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.25, 0.8, 4, 8) : new THREE.CylinderGeometry(0.25, 0.25, 0.8);
          const cobMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
          const cob = new THREE.Mesh(cobGeo, cobMat);
          cob.position.set(px + 0.4, 2.0, pz);
          group.add(cob);
        }
      }
    }
    this.scene.add(group);
  }

  createSensorPin(x, y, z, sectorId, sectorName) {
    const pinGroup = new THREE.Group();
    pinGroup.position.set(x, y, z);

    // Glowing vertical pole
    const poleGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.25;
    pinGroup.add(pole);

    // Pulsing beacon sphere
    const beaconGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 4.8;
    beacon.userData = { isSensorPin: true, sectorId, sectorName };
    pinGroup.add(beacon);

    this.scene.add(pinGroup);
    this.sensorPins.push(beacon);
  }

  addPerimeterTrees() {
    const treeGeo = new THREE.ConeGeometry(2, 5, 5);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x064e3b });
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.5, 2);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e });

    const positions = [
      [-40, -40], [0, -40], [40, -40],
      [-40, 40], [0, 40], [40, 40],
      [-40, 0], [40, 0]
    ];

    positions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeGeo, treeMat);
      foliage.position.y = 4;
      foliage.castShadow = true;
      tree.add(foliage);

      this.scene.add(tree);
    });
  }

  createDrone() {
    this.drone = new THREE.Group();
    this.drone.position.set(0, 18, 0);

    // Drone central body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.6, 2.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.drone.add(body);

    // Camera gimbal lens
    const lensGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.y = -0.4;
    this.drone.add(lens);

    // 4 Rotor arms & spinning blades
    const offsets = [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]];
    offsets.forEach(([dx, dz]) => {
      const propGeo = new THREE.BoxGeometry(1.6, 0.05, 0.2);
      const propMat = new THREE.MeshStandardMaterial({ color: 0x34d399 });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(dx, 0.4, dz);
      this.drone.add(prop);
      this.dronePropellers.push(prop);
    });

    this.scene.add(this.drone);
  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    if (this.isNight) {
      this.scene.background.setHex(0x02070c);
      this.scene.fog.color.setHex(0x02070c);
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.3;
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.4;
    } else {
      this.scene.background.setHex(0x06150e);
      this.scene.fog.color.setHex(0x06150e);
      this.ambientLight.color.setHex(0xd1fae5);
      this.ambientLight.intensity = 0.6;
      this.sunLight.color.setHex(0xfffbeb);
      this.sunLight.intensity = 1.2;
    }
  }

  toggleRain() {
    this.isRaining = !this.isRaining;
    if (this.isRaining) {
      if (!this.rainParticles) {
        const count = 1200;
        this.rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 80;
          positions[i + 1] = Math.random() * 40;
          positions[i + 2] = (Math.random() - 0.5) * 80;
        }
        this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMat = new THREE.PointsMaterial({
          color: 0x60a5fa,
          size: 0.35,
          transparent: true,
          opacity: 0.8
        });
        this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
        this.scene.add(this.rainParticles);
      }
      this.rainParticles.visible = true;
    } else {
      if (this.rainParticles) this.rainParticles.visible = false;
    }
  }

  toggleDroneSurvey() {
    this.isDroneSurvey = !this.isDroneSurvey;
    if (this.isDroneSurvey) {
      // Toggle NDVI false color health visualization on terrain
      this.cropSectors.forEach((sec, idx) => {
        sec.material.color.setHex(idx === 1 ? 0xf59e0b : 0x10b981);
      });
    } else {
      // Restore standard realistic greens
      const standardColors = [0x10b981, 0x059669, 0x047857, 0x15803d];
      this.cropSectors.forEach((sec, idx) => {
        sec.material.color.setHex(standardColors[idx]);
      });
    }
  }

  onCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.sensorPins);

    if (intersects.length > 0) {
      const pin = intersects[0].object;
      const sectorId = pin.userData.sectorId;
      window.dispatchEvent(new CustomEvent("farm:select-sector", { detail: { sectorId } }));
    }
  }

  onWindowResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    // Rotate drone propellers
    this.dronePropellers.forEach(p => p.rotation.y += 0.4);

    // Drone flight path animation
    if (this.drone) {
      const t = time * 0.001;
      if (this.isDroneSurvey) {
        this.drone.position.x = Math.sin(t * 0.8) * 25;
        this.drone.position.z = Math.cos(t * 0.8) * 25;
        this.drone.position.y = 15 + Math.sin(t * 2) * 1.5;
        this.drone.rotation.y = t * 0.8 + Math.PI / 2;
      } else {
        // Idle gentle hover
        this.drone.position.y = 18 + Math.sin(t * 1.5) * 0.6;
      }
    }

    // Animate raindrops
    if (this.isRaining && this.rainGeo) {
      const positions = this.rainGeo.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 1.2;
        if (positions[i] < 0) positions[i] = 40;
      }
      this.rainGeo.attributes.position.needsUpdate = true;
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
