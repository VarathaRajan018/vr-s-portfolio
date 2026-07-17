import * as THREE from 'three';

let scene, camera, renderer;
let particles, grid, ringsGroup;
let floatingObjects = [];
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let scrollY = 0;

// Dynamic positioning markers to fit profile card centers
let centerPos = new THREE.Vector3(3.5, 0.2, 0);
let positionRadius = 3.6;
let objectScaleMultiplier = 1.0;

function updateThreeLayout() {
  const isMobile = window.innerWidth <= 992;
  centerPos.set(isMobile ? 0 : 3.5, isMobile ? -2.2 : 0.2, isMobile ? -0.5 : 0);
  positionRadius = isMobile ? 1.85 : 3.6;
  objectScaleMultiplier = isMobile ? 0.55 : 1.0;
  
  floatingObjects.forEach((obj) => {
    const baseScale = obj.userData.baseScale || 0.4;
    const finalScale = baseScale * objectScaleMultiplier;
    obj.scale.set(finalScale, finalScale, finalScale);
    obj.userData.positionRadius = positionRadius;
  });
  
  if (ringsGroup) {
    ringsGroup.position.copy(centerPos);
    ringsGroup.userData.baseScale = isMobile ? 0.55 : 1.0;
  }
  
  if (camera) {
    camera.position.z = isMobile ? 9 : 8;
  }
}

export function initThreeBg() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // --- 1. Scene, Camera & Renderer Setup ---
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060b, 0.015);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // --- 2. Lighting System ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x06b6d4, 5, 25);
  cyanLight.position.set(5, 5, 5);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 6, 25);
  purpleLight.position.set(-5, -5, 5);
  scene.add(purpleLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(0, 10, 10);
  scene.add(dirLight);

  // --- 3. Interactive Particle Starfield ---
  createParticles();

  // --- 4. Neon Synthwave Grid ---
  createGrid();

  // --- 5. Background Orbital Rings ---
  createOrbitalRings();

  // --- 6. Floating 3D Tech Objects ---
  createFloatingObjects();

  // Setup initial dynamic coordinate spacing
  updateThreeLayout();

  // --- 7. Listeners ---
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);

  // --- 8. Animation Loop ---
  animate();
}

// --- Particles Creator ---
function createParticles() {
  const particleCount = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const randomSpeeds = new Float32Array(particleCount);

  const colorCyan = new THREE.Color(0x06b6d4);
  const colorPurple = new THREE.Color(0x8b5cf6);

  for (let i = 0; i < particleCount; i++) {
    // Distribute in a spherical region
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 15 + Math.random() * 20;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Color mixing (Cyan to Purple)
    const mixedColor = new THREE.Color().lerpColors(colorCyan, colorPurple, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;

    randomSpeeds[i] = 0.05 + Math.random() * 0.15;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom circular point texture
  const pSize = 0.07;
  const mat = new THREE.PointsMaterial({
    size: pSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particles = new THREE.Points(geometry, mat);
  scene.add(particles);
  particles.userData = { speeds: randomSpeeds };
}

// --- Neon Grid Creator ---
function createGrid() {
  const gridHelper = new THREE.GridHelper(60, 60, 0x8b5cf6, 0x22173b);
  grid = new THREE.Group();
  grid.add(gridHelper);
  
  grid.position.y = -6;
  grid.position.z = -5;
  grid.rotation.x = Math.PI / 12; // tilt towards camera
  scene.add(grid);
}

// --- Glowing Orbital Rings behind card ---
function createOrbitalRings() {
  ringsGroup = new THREE.Group();
  ringsGroup.position.set(3.5, 0, -1); // Positioned behind the card on the right side
  scene.add(ringsGroup);

  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.35 });
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.25 });

  const ringGeo1 = new THREE.TorusGeometry(3.0, 0.05, 8, 48);
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  ringsGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(3.4, 0.03, 6, 40);
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  ringsGroup.add(ring2);
}

// --- Floating Procedural Objects ---
function createFloatingObjects() {
  // Glass Material with premium reflection / transmission attributes
  const glassMaterial = (color) => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.85,
    roughness: 0.15,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });

  const wireMaterial = (color) => new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });

  const positionRadius = 3.6; // radius of elements floating around the profile image
  const centerPos = new THREE.Vector3(3.5, 0.2, 0); // Aligns with profile card container on desktop

  // Object templates with basic geometries mimicking requested tools:
  const configs = [
    { name: 'Laptop', color: 0x8b5cf6, scale: 0.5 },
    { name: 'AI Chip', color: 0x06b6d4, scale: 0.4 },
    { name: 'Cloud', color: 0x0ea5e9, scale: 0.45 },
    { name: 'Code Brackets', color: 0xf8fafc, scale: 0.35 },
    { name: 'Database', color: 0x8b5cf6, scale: 0.45 },
    { name: 'React Logo', color: 0x06b6d4, scale: 0.45 },
    { name: 'Python Logo', color: 0x0ea5e9, scale: 0.4 },
    { name: 'GitHub Logo', color: 0xf8fafc, scale: 0.4 }
  ];

  configs.forEach((cfg, idx) => {
    const angle = (idx / configs.length) * Math.PI * 2;
    const itemGroup = new THREE.Group();

    // Procedural modelling of elements
    if (cfg.name === 'Laptop') {
      // Screen & Keyboard base
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.05), glassMaterial(cfg.color));
      screen.position.y = 0.45;
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.9), glassMaterial(0xffffff));
      base.position.z = 0.45;
      itemGroup.add(screen, base);
    } 
    else if (cfg.name === 'AI Chip') {
      // Main square chip body with smaller pin box extrusions
      const core = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.2), glassMaterial(cfg.color));
      const gridHelper = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 0.22), wireMaterial(0xffffff));
      itemGroup.add(core, gridHelper);
    } 
    else if (cfg.name === 'Cloud') {
      // Bulky intersecting spheres forming a cloud shape
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), glassMaterial(cfg.color));
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), glassMaterial(cfg.color));
      s2.position.set(0.4, -0.1, 0);
      const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), glassMaterial(cfg.color));
      s3.position.set(-0.4, -0.1, 0);
      itemGroup.add(s1, s2, s3);
    } 
    else if (cfg.name === 'Code Brackets') {
      // Simplified brackets using small rotated rods
      const leftUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), glassMaterial(cfg.color));
      leftUpper.rotation.z = Math.PI / 4;
      leftUpper.position.set(-0.3, 0.2, 0);
      const leftLower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), glassMaterial(cfg.color));
      leftLower.rotation.z = -Math.PI / 4;
      leftLower.position.set(-0.3, -0.2, 0);

      const rightUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), glassMaterial(cfg.color));
      rightUpper.rotation.z = -Math.PI / 4;
      rightUpper.position.set(0.3, 0.2, 0);
      const rightLower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), glassMaterial(cfg.color));
      rightLower.rotation.z = Math.PI / 4;
      rightLower.position.set(0.3, -0.2, 0);

      itemGroup.add(leftUpper, leftLower, rightUpper, rightLower);
    } 
    else if (cfg.name === 'Database') {
      // 3 stacked cylinders
      const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 16), glassMaterial(cfg.color));
      c1.position.y = 0.3;
      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 16), glassMaterial(0xffffff));
      const c3 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 16), glassMaterial(cfg.color));
      c3.position.y = -0.3;
      itemGroup.add(c1, c2, c3);
    } 
    else if (cfg.name === 'React Logo') {
      // Nucleus and orbits
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), glassMaterial(cfg.color));
      const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 6, 32), wireMaterial(0xffffff));
      const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 6, 32), wireMaterial(0xffffff));
      orbit2.rotation.x = Math.PI / 3;
      const orbit3 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 6, 32), wireMaterial(0xffffff));
      orbit3.rotation.y = Math.PI / 3;
      itemGroup.add(core, orbit1, orbit2, orbit3);
    } 
    else if (cfg.name === 'Python Logo') {
      // Two interlocking curved segments (mocked by interlocking rounded box rings)
      const ring1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.35), glassMaterial(0x06b6d4));
      ring1.position.y = 0.16;
      const ring2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.35), glassMaterial(0x8b5cf6));
      ring2.rotation.z = Math.PI / 2;
      ring2.position.y = -0.16;
      itemGroup.add(ring1, ring2);
    } 
    else if (cfg.name === 'GitHub Logo') {
      // A glossy glass disk with a wireframe core
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24), glassMaterial(0xffffff));
      disk.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 24), wireMaterial(cfg.color));
      itemGroup.add(disk, core);
    }

    // Set scale & positions
    itemGroup.scale.set(cfg.scale, cfg.scale, cfg.scale);
    
    // Position on orbit circle around centerPos
    const itemX = centerPos.x + Math.cos(angle) * positionRadius;
    const itemY = centerPos.y + Math.sin(angle) * positionRadius;
    const itemZ = centerPos.z + (Math.random() - 0.5) * 1.2;
    itemGroup.position.set(itemX, itemY, itemZ);

    // Save random rotation speeds in userData
    itemGroup.userData = {
      baseScale: cfg.scale,
      baseAngle: angle,
      rotXSpeed: 0.005 + Math.random() * 0.012,
      rotYSpeed: 0.005 + Math.random() * 0.012,
      rotZSpeed: 0.003 + Math.random() * 0.008,
      orbitSpeed: 0.002 + Math.random() * 0.004,
      bounceSpeed: 1 + Math.random() * 2,
      bounceOffset: Math.random() * Math.PI * 2,
      positionRadius: positionRadius
    };

    scene.add(itemGroup);
    floatingObjects.push(itemGroup);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  updateThreeLayout();
}

function onMouseMove(event) {
  // Normalize cursor positions between -1 and 1
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
}

export function handleThreeScroll(y) {
  scrollY = y;
}

// --- Animation Core Loop ---
function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // 1. Mouse Lerping (smooth delay)
  mouse.x += (mouse.targetX - mouse.x) * 0.08;
  mouse.y += (mouse.targetY - mouse.y) * 0.08;

  // 2. Parallax Camera motion based on mouse
  camera.position.x = mouse.x * 1.5;
  camera.position.y = mouse.y * 1.5 + (scrollY * -0.002); // Add light scroll vertical translation
  camera.lookAt(0, scrollY * -0.002, 0);

  // 3. Grid Motion (creates effect of traveling forward)
  if (grid) {
    grid.children[0].position.z = (time * 1.5) % 2; // loops texture movement offset
    // Tilt grid slightly based on mouse
    grid.rotation.y = mouse.x * 0.05;
  }

  // 4. Animate Background Star Particles (Optimized: Static GPU rotation to avoid CPU buffer uploads)
  if (particles) {
    particles.rotation.y = time * 0.015;
    particles.rotation.x = time * 0.008;
    
    // Smooth group parallax drift following mouse
    particles.position.x += (mouse.x * 2.0 - particles.position.x) * 0.05;
    particles.position.y += (mouse.y * 2.0 - particles.position.y) * 0.05;
  }

  // 5. Pulsing Orbital Rings
  if (ringsGroup) {
    ringsGroup.children[0].rotation.x += 0.003;
    ringsGroup.children[0].rotation.z += 0.002;
    ringsGroup.children[1].rotation.y -= 0.002;
    ringsGroup.children[1].rotation.x += 0.001;

    // Pulse size slightly based on math sine
    const baseRScale = ringsGroup.userData.baseScale || 1.0;
    const scaleFactor = baseRScale * (1 + Math.sin(time * 1.8) * 0.03);
    ringsGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Light parallax drift
    ringsGroup.position.x = centerPos.x + mouse.x * 0.4;
    ringsGroup.position.y = centerPos.y + mouse.y * 0.4;
  }

  // 6. Floating Technology Objects around profile
  floatingObjects.forEach((obj, idx) => {
    const ud = obj.userData;
    
    // Rotate object on its local axes
    obj.rotation.x += ud.rotXSpeed;
    obj.rotation.y += ud.rotYSpeed;
    obj.rotation.z += ud.rotZSpeed;

    // Slow orbital rotation around the card
    ud.baseAngle += ud.orbitSpeed * 0.4;
    
    // Small vertical floating hover bounce
    const bounce = Math.sin(time * ud.bounceSpeed + ud.bounceOffset) * 0.12;

    // Position recalculation
    const x = centerPos.x + Math.cos(ud.baseAngle) * ud.positionRadius + mouse.x * 0.3;
    const y = centerPos.y + Math.sin(ud.baseAngle) * ud.positionRadius + bounce + mouse.y * 0.3;
    const z = centerPos.z + Math.sin(time * 0.5 + idx) * 0.4; // light depth floating

    obj.position.set(x, y, z);
  });

  renderer.render(scene, camera);
}

const clock = new THREE.Clock();
