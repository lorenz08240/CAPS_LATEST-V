import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * NepotatoGPU — Photorealistic Procedural Triple-Fan Graphics Card
 * 
 * Ported from: https://github.com/arar228/nepotato-threejs-gpu (MIT License)
 * Calibrated for BuildLab:
 *  - Procedural aerofoil fan blades with continuous multi-speed rotation in useFrame
 *  - 58-fin aluminum heatsink & 4-tube copper heat pipe array
 *  - Brushed backplate with flow-through ventilation
 *  - Dual 8-pin power sockets with pin wells
 *  - Real-time RGB LED aura channels synced to workspace rgbColor
 *  - Full exploded view assembly separation
 */

function roundedBox(width, height, depth, radius = 0.08) {
  return new RoundedBoxGeometry(width, height, depth, 4, radius);
}

function buildFan(frameMaterial, bladeMaterial, hubMaterial) {
  const fan = new THREE.Group();
  const rotor = new THREE.Group();
  fan.name = 'fan-assembly';
  rotor.name = 'fan-rotor';

  const well = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 48),
    new THREE.MeshStandardMaterial({ color: 0x05080b, roughness: 0.82 })
  );
  well.position.z = -0.05;
  fan.add(well);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.01, 0.055, 12, 64),
    frameMaterial
  );
  outerRing.position.z = 0.06;
  fan.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.022, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x111820, metalness: 0.25, roughness: 0.45 })
  );
  innerRing.position.z = 0.085;
  fan.add(innerRing);

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0.255, -0.02);
  bladeShape.bezierCurveTo(0.4, -0.06, 0.62, -0.24, 0.81, -0.41);
  bladeShape.bezierCurveTo(0.89, -0.46, 0.95, -0.35, 0.91, -0.22);
  bladeShape.bezierCurveTo(0.78, -0.09, 0.53, 0.045, 0.32, 0.15);
  bladeShape.bezierCurveTo(0.265, 0.17, 0.245, 0.065, 0.255, -0.02);
  bladeShape.closePath();

  const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    curveSegments: 8,
  });

  const bladePositions = bladeGeometry.getAttribute('position');
  for (let vertex = 0; vertex < bladePositions.count; vertex += 1) {
    const x = bladePositions.getX(vertex);
    const y = bladePositions.getY(vertex);
    const radial = Math.hypot(x, y);
    bladePositions.setZ(vertex, bladePositions.getZ(vertex) + (radial - 0.25) * 0.065 - y * 0.025);
  }
  bladePositions.needsUpdate = true;
  bladeGeometry.computeVertexNormals();

  for (let index = 0; index < 11; index += 1) {
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.rotation.z = (index / 11) * Math.PI * 2 + 0.16;
    blade.position.z = 0.082;
    rotor.add(blade);
  }

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.32, 0.16, 36),
    hubMaterial
  );
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.14;
  rotor.add(hub);

  const hubCap = new THREE.Mesh(
    new THREE.CircleGeometry(0.245, 36),
    new THREE.MeshPhysicalMaterial({
      color: 0x69737d,
      metalness: 0.9,
      roughness: 0.4,
      clearcoat: 0.14,
      clearcoatRoughness: 0.36,
    })
  );
  hubCap.position.z = 0.225;
  rotor.add(hubCap);

  fan.add(rotor);
  fan.userData.rotor = rotor;
  return fan;
}

function buildNepotatoCard() {
  const card = new THREE.Group();
  card.name = 'gpu-card-root';

  const coatedMetal = new THREE.MeshPhysicalMaterial({
    color: 0x1e2836,
    metalness: 0.65,
    roughness: 0.3,
    clearcoat: 0.2,
  });
  const darkPanel = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.35,
    roughness: 0.5,
    clearcoat: 0.1,
  });
  const blackPolymer = new THREE.MeshStandardMaterial({
    color: 0x070a0e,
    metalness: 0.08,
    roughness: 0.45,
  });
  const bladeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111827,
    metalness: 0.1,
    roughness: 0.35,
    clearcoat: 0.25,
  });
  const bareMetal = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.2,
  });
  const hubMetal = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    metalness: 0.9,
    roughness: 0.25,
    clearcoat: 0.2,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.95,
    roughness: 0.2,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.9,
    roughness: 0.22,
  });
  const ledCoreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 2.8,
    metalness: 0,
    roughness: 0.2,
    clearcoat: 0.4,
  });

  // 1. REAR ASSEMBLY (Backplate + vents + screws)
  const rearAssembly = new THREE.Group();
  rearAssembly.name = 'gpu-rear-assembly';
  card.add(rearAssembly);

  const backplate = new THREE.Mesh(roundedBox(7.18, 2.72, 0.22, 0.12), darkPanel);
  backplate.position.z = -0.53;
  backplate.name = 'gpu-backplate';
  rearAssembly.add(backplate);

  const rearInsetMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.3,
  });
  const rearInset = new THREE.Mesh(roundedBox(6.58, 2.18, 0.045, 0.08), rearInsetMaterial);
  rearInset.position.set(-0.08, 0, -0.665);
  rearAssembly.add(rearInset);

  const rearSeamGeometry = roundedBox(2.05, 0.045, 0.022, 0.012);
  [
    [-2.02, 0.62, 0.24],
    [-0.2, 0.08, -0.18],
    [1.62, -0.62, 0.22],
  ].forEach(([x, y, rotation]) => {
    const seam = new THREE.Mesh(rearSeamGeometry, coatedMetal);
    seam.position.set(x, y, -0.7);
    seam.rotation.z = rotation;
    rearAssembly.add(seam);
  });

  for (let index = 0; index < 7; index += 1) {
    const vent = new THREE.Mesh(roundedBox(0.62, 0.055, 0.025, 0.012), blackPolymer);
    vent.position.set(2.35, -0.63 + index * 0.21, -0.705);
    vent.rotation.z = -0.2;
    rearAssembly.add(vent);
  }

  const rearScrewGeometry = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16);
  [[-2.9, 0.86], [-2.9, -0.86], [2.92, 0.86], [2.92, -0.86], [0, 0.92], [0, -0.92]].forEach(([x, y]) => {
    const screw = new THREE.Mesh(rearScrewGeometry, bareMetal);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, -0.71);
    rearAssembly.add(screw);
  });

  // 2. MAIN PCB
  const pcb = new THREE.Mesh(
    roundedBox(6.72, 2.3, 0.1, 0.055),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.15, roughness: 0.65 })
  );
  pcb.position.set(-0.16, -0.05, -0.39);
  pcb.name = 'gpu-pcb';
  card.add(pcb);

  // 3. 58-FIN ALUMINUM HEATSINK
  const heatsink = new THREE.Group();
  heatsink.name = 'gpu-heatsink';
  const finGeometry = new THREE.BoxGeometry(0.055, 2.42, 0.72);
  for (let index = 0; index < 58; index += 1) {
    const fin = new THREE.Mesh(finGeometry, bareMetal);
    fin.position.set(-3.22 + index * 0.113, 0, -0.15);
    heatsink.add(fin);
  }
  card.add(heatsink);

  // 4. 4-TUBE COPPER HEAT PIPES
  const heatPipes = new THREE.Group();
  heatPipes.name = 'gpu-heat-pipe-bank';
  [-0.72, -0.24, 0.24, 0.72].forEach((y, index) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, y, -0.52),
      new THREE.Vector3(-1.25, y + 0.08 * (index % 2 ? 1 : -1), -0.56),
      new THREE.Vector3(0.5, y - 0.06, -0.55),
      new THREE.Vector3(2.75, y, -0.5),
    ]);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.045, 8, false), copper);
    heatPipes.add(pipe);
  });
  card.add(heatPipes);

  // 5. FRONT CORE & SHROUD
  const frontCore = new THREE.Mesh(roundedBox(7.22, 2.68, 0.34, 0.13), blackPolymer);
  frontCore.position.z = 0.14;
  frontCore.name = 'gpu-front-core';
  card.add(frontCore);

  const shroudShape = new THREE.Shape();
  shroudShape.moveTo(-3.58, -0.94);
  shroudShape.lineTo(-3.29, -1.25);
  shroudShape.lineTo(-2.76, -1.35);
  shroudShape.lineTo(-2.44, -1.24);
  shroudShape.lineTo(-1.35, -1.24);
  shroudShape.lineTo(-1.1, -1.36);
  shroudShape.lineTo(0.83, -1.3);
  shroudShape.lineTo(1.08, -1.2);
  shroudShape.lineTo(2.15, -1.18);
  shroudShape.lineTo(2.42, -1.27);
  shroudShape.lineTo(3.22, -1.12);
  shroudShape.lineTo(3.56, -0.78);
  shroudShape.lineTo(3.55, 0.75);
  shroudShape.lineTo(3.25, 1.08);
  shroudShape.lineTo(2.5, 1.19);
  shroudShape.lineTo(2.18, 1.29);
  shroudShape.lineTo(1.18, 1.22);
  shroudShape.lineTo(0.95, 1.34);
  shroudShape.lineTo(-0.78, 1.34);
  shroudShape.lineTo(-1.02, 1.23);
  shroudShape.lineTo(-2.2, 1.23);
  shroudShape.lineTo(-2.5, 1.35);
  shroudShape.lineTo(-3.34, 1.23);
  shroudShape.lineTo(-3.61, 0.92);
  shroudShape.closePath();

  [
    { x: -2.38, radius: 1.07 },
    { x: 0.02, radius: 1.07 },
    { x: 2.32, radius: 1.07 },
  ].forEach(({ x, radius }) => {
    const hole = new THREE.Path();
    hole.absarc(x, 0, radius, 0, Math.PI * 2, true);
    shroudShape.holes.push(hole);
  });

  const shroudGeometry = new THREE.ExtrudeGeometry(shroudShape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.045,
    curveSegments: 36,
  });
  shroudGeometry.translate(0, 0, 0.27);
  const shroud = new THREE.Mesh(shroudGeometry, coatedMetal);
  shroud.name = 'gpu-front-shroud';
  card.add(shroud);

  // 6. TRIPLE FANS
  const fanFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x242e38,
    metalness: 0.7,
    roughness: 0.25,
  });
  const rotors = [];
  const fanAssemblies = [];
  [
    { x: -2.38, scale: 1.02, id: 'gpu-fan-left' },
    { x: 0.02, scale: 1.02, id: 'gpu-fan-center' },
    { x: 2.32, scale: 1.02, id: 'gpu-fan-right' },
  ].forEach(({ x, scale, id }, index) => {
    const fan = buildFan(fanFrameMaterial, bladeMaterial, hubMetal);
    fan.position.set(x, 0, 0.55);
    fan.scale.setScalar(scale);
    fan.name = `fan-assembly-${index + 1}`;
    fan.userData.rotor.name = id;
    card.add(fan);
    fanAssemblies.push(fan);
    rotors.push(fan.userData.rotor);
  });

  // Fan Fasteners
  const fanFastenerGeometry = new THREE.CylinderGeometry(0.048, 0.048, 0.055, 16);
  [-2.38, 0.02, 2.32].forEach((fanX) => {
    [Math.PI * 0.24, Math.PI * 0.76, Math.PI * 1.24, Math.PI * 1.76].forEach((angle) => {
      const fastener = new THREE.Mesh(fanFastenerGeometry, bareMetal);
      fastener.rotation.x = Math.PI / 2;
      fastener.position.set(fanX + Math.cos(angle) * 1.04, Math.sin(angle) * 1.04, 0.61);
      card.add(fastener);
    });
  });

  // 7. POWER SOCKETS (Dual 8-pin)
  const powerSocketMaterial = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.1,
    roughness: 0.5,
  });
  [1.72, 2.36].forEach((x) => {
    const socket = new THREE.Mesh(roundedBox(0.54, 0.3, 0.42, 0.035), powerSocketMaterial);
    socket.position.set(x, 1.33, -0.18);
    card.add(socket);
  });

  // 8. SIDE RGB LED CHANNELS
  const ledChannels = new THREE.Group();
  ledChannels.name = 'gpu-led-channel-system';
  const ledPaths = [
    { id: 'top-left', points: [[-1.72, 1.02], [-1.31, 0.93], [-0.88, 1.04]] },
    { id: 'top-right', points: [[0.78, 1.0], [1.18, 0.91], [1.61, 1.0]] },
    { id: 'bottom-left', points: [[-1.72, -1.02], [-1.31, -0.93], [-0.88, -1.04]] },
    { id: 'bottom-right', points: [[0.78, -1.0], [1.18, -0.91], [1.61, -1.0]] },
  ];
  ledPaths.forEach(({ id, points }) => {
    const vectors = points.map(([x, y]) => new THREE.Vector3(x, y, 0.592));
    const path = new THREE.CurvePath();
    for (let index = 0; index < vectors.length - 1; index += 1) {
      path.add(new THREE.LineCurve3(vectors[index], vectors[index + 1]));
    }
    const core = new THREE.Mesh(new THREE.TubeGeometry(path, 20, 0.024, 8, false), ledCoreMaterial);
    core.name = `gpu-led-channel-${id}`;
    ledChannels.add(core);
  });
  card.add(ledChannels);

  // 9. REAR I/O BRACKET WITH PORTS
  const bracketOutline = new THREE.Shape();
  bracketOutline.moveTo(-0.16, 1.82);
  bracketOutline.lineTo(0.25, 1.82);
  bracketOutline.lineTo(0.25, 1.58);
  bracketOutline.lineTo(0.48, 1.58);
  bracketOutline.lineTo(0.48, -1.45);
  bracketOutline.lineTo(0.23, -1.45);
  bracketOutline.lineTo(0.23, -1.82);
  bracketOutline.lineTo(-0.2, -1.82);
  bracketOutline.lineTo(-0.2, -1.56);
  bracketOutline.lineTo(-0.4, -1.56);
  bracketOutline.lineTo(-0.4, 1.55);
  bracketOutline.lineTo(-0.16, 1.55);
  bracketOutline.closePath();

  const bracketGeometry = new THREE.ExtrudeGeometry(bracketOutline, {
    depth: 0.88,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 2,
  });
  bracketGeometry.translate(0, 0, -0.44);
  const bracket = new THREE.Mesh(bracketGeometry, bareMetal);
  bracket.position.set(-3.72, -0.18, -0.03);
  bracket.rotation.y = Math.PI / 2;
  bracket.name = 'gpu-io-bracket';
  card.add(bracket);

  // Display Ports on Bracket
  [0.7, 0.18, -0.34, -0.86].forEach((y) => {
    const portTrim = new THREE.Mesh(roundedBox(0.1, 0.44, 0.44, 0.025), darkPanel);
    portTrim.position.set(-4.18, y, -0.03);
    card.add(portTrim);
    const port = new THREE.Mesh(roundedBox(0.115, 0.3, 0.32, 0.018), blackPolymer);
    port.position.set(-4.25, y, -0.03);
    card.add(port);
  });

  // 10. PCIE X16 CONNECTOR
  const connectorShoulder = new THREE.Mesh(
    roundedBox(2.75, 0.3, 0.18, 0.025),
    blackPolymer
  );
  connectorShoulder.position.set(-0.72, -1.49, -0.18);
  connectorShoulder.name = 'gpu-pcie-shoulder';
  card.add(connectorShoulder);

  const connector = new THREE.Mesh(roundedBox(2.55, 0.15, 0.13, 0.025), gold);
  connector.position.set(-0.72, -1.65, -0.08);
  connector.name = 'gpu-pcie-connector';
  card.add(connector);

  // 11. RIGHT-END RADIATOR EXHAUST
  const rightEndFrame = new THREE.Group();
  rightEndFrame.name = 'gpu-right-end-radiator';
  const rightEndCap = new THREE.Mesh(roundedBox(0.22, 2.36, 1.02, 0.045), darkPanel);
  rightEndCap.position.set(3.48, 0, -0.04);
  rightEndFrame.add(rightEndCap);

  const endFinGeometry = new THREE.BoxGeometry(0.255, 0.055, 0.78);
  for (let fin = 0; fin < 18; fin += 1) {
    const rib = new THREE.Mesh(endFinGeometry, coatedMetal);
    rib.position.set(3.6, -0.9 + fin * 0.105, -0.04);
    rightEndFrame.add(rib);
  }
  card.add(rightEndFrame);

  card.userData = {
    rotors,
    shroud,
    backplate,
    rearAssembly,
    fanAssemblies,
    heatsink,
    heatPipes,
    bracket,
    ledCoreMaterial,
    coatedMetal,
    darkPanel,
  };

  return card;
}

export default function NepotatoGPU({
  rgbColor = '#00e5ff',
  explodedProgress = 0,
  isSelected = false,
  isHovered = false,
  isStandalone = false
}) {
  const groupRef = useRef();

  const cardModel = useMemo(() => buildNepotatoCard(), []);

  // Real-time animation of triple fans + RGB LED sync + Exploded View displacement
  useFrame((_, delta) => {
    if (!cardModel?.userData) return;
    const { rotors, shroud, backplate, fanAssemblies, heatsink, heatPipes, bracket, ledCoreMaterial, coatedMetal } = cardModel.userData;

    // 1. Triple fan staggered continuous rotation
    if (rotors && rotors.length === 3) {
      rotors[0].rotation.z += delta * 3.4;
      rotors[1].rotation.z += delta * 3.0;
      rotors[2].rotation.z += delta * 3.5;
    }

    // 2. Synchronize RGB Aura
    if (ledCoreMaterial) {
      const activeColor = isSelected ? '#facc15' : rgbColor;
      ledCoreMaterial.color.set(activeColor);
      ledCoreMaterial.emissive.set(activeColor);
      ledCoreMaterial.emissiveIntensity = isSelected ? 4.2 : 2.8;
    }

    // 3. Selection / Hover highlight on shroud
    if (coatedMetal) {
      if (isSelected) {
        coatedMetal.emissive.set('#facc15');
        coatedMetal.emissiveIntensity = 0.5;
      } else if (isHovered) {
        coatedMetal.emissive.set('#38bdf8');
        coatedMetal.emissiveIntensity = 0.35;
      } else {
        coatedMetal.emissive.set(0x000000);
        coatedMetal.emissiveIntensity = 0;
      }
    }

    // 4. Smooth Exploded View Layer Separation
    if (shroud && backplate) {
      const p = Math.max(0, Math.min(1, explodedProgress));
      shroud.position.z = 0.27 + p * 0.85;
      backplate.position.z = -0.53 - p * 0.75;
      if (heatsink) heatsink.position.z = -0.15 + p * 0.3;
      if (heatPipes) heatPipes.position.z = p * 0.25;
      if (bracket) bracket.position.x = -3.72 - p * 0.6;
      if (fanAssemblies) {
        fanAssemblies.forEach((fan) => {
          fan.position.z = 0.55 + p * 1.4;
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group
        position={isStandalone ? [0.1, 0, 0] : [-0.27, -0.048, 0.432]}
        rotation={isStandalone ? [0.15, 0.35, -0.05] : [Math.PI / 2, 0, Math.PI / 2]}
        scale={isStandalone ? [0.55, 0.55, 0.55] : [0.6, 0.6, 0.6]}
      >
        <primitive object={cardModel} />
      </group>
    </group>
  );
}

