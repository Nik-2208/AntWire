/**
 * ANTWIRE — 3D Anatomical Ant Model & Caste/Role Morphology
 * Distinct morphology and coloration for Queens, Soldiers/Guards, Nurses, Scouts, Foragers, and Sanitation workers.
 * Lightweight procedural geometry optimized for low-end GPUs with high contrast visibility.
 */

import * as THREE from 'three';
import { Ant } from '../ants/ant';
import { AntCaste, WorkerRole } from '../simulation/types';

export class Ant3DModel {
  public group: THREE.Group;
  public antId: string;

  // Segment references
  private headGroup: THREE.Group;
  private thoraxMesh: THREE.Mesh;
  private abdomenMesh: THREE.Mesh;
  private leftAntenna: THREE.Line;
  private rightAntenna: THREE.Line;
  private legs: THREE.Group[] = [];
  private cargoMesh: THREE.Mesh;
  private selectionRing: THREE.Mesh;
  private queenCrownRing: THREE.Mesh | null = null;

  // Segment materials
  private chitinMat: THREE.MeshLambertMaterial;

  private static eyeMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a, // Bright yellow-white compound eyes
  });

  private static cargoMat = new THREE.MeshBasicMaterial({
    color: 0x10b981, // Glowing emerald sugar crystal
  });

  private static antennaMat = new THREE.LineBasicMaterial({
    color: 0xfde047, // Bright yellow antennae
    linewidth: 2,
  });

  private static legMat = new THREE.MeshLambertMaterial({
    color: 0x78350f, // Darker amber legs
  });

  private static selectionMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Electric cyan selection ring
    wireframe: true,
  });

  private static crownMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24, // Gold royal crown halo
    wireframe: true,
  });

  private currentCaste: AntCaste = 'WORKER';
  private currentRole: WorkerRole = 'FORAGER';

  constructor(antId: string) {
    this.antId = antId;
    this.group = new THREE.Group();

    // Default chitin material (instanced per ant to allow caste/role tinting)
    this.chitinMat = new THREE.MeshLambertMaterial({
      color: 0xb45309, // Default amber-bronze
    });

    // 1. Thorax / Mesosoma
    const thoraxGeo = new THREE.SphereGeometry(0.26, 6, 6);
    thoraxGeo.scale(1.0, 0.75, 1.6);
    this.thoraxMesh = new THREE.Mesh(thoraxGeo, this.chitinMat);
    this.group.add(this.thoraxMesh);

    // 2. Head with Mandibles & Eyes
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.06, 0.45);

    const headGeo = new THREE.SphereGeometry(0.22, 6, 6);
    headGeo.scale(1.1, 0.9, 1.2);
    const headMesh = new THREE.Mesh(headGeo, this.chitinMat);
    this.headGroup.add(headMesh);

    // Bright Compound Eyes
    const eyeGeo = new THREE.SphereGeometry(0.07, 4, 4);
    const leftEye = new THREE.Mesh(eyeGeo, Ant3DModel.eyeMat);
    leftEye.position.set(-0.16, 0.09, 0.09);
    const rightEye = new THREE.Mesh(eyeGeo, Ant3DModel.eyeMat);
    rightEye.position.set(0.16, 0.09, 0.09);
    this.headGroup.add(leftEye);
    this.headGroup.add(rightEye);

    // Mandibles
    const mandibleGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
    mandibleGeo.rotateX(Math.PI / 2);
    const leftMandible = new THREE.Mesh(mandibleGeo, this.chitinMat);
    leftMandible.position.set(-0.09, -0.06, 0.24);
    leftMandible.rotation.y = 0.35;
    const rightMandible = new THREE.Mesh(mandibleGeo, this.chitinMat);
    rightMandible.position.set(0.09, -0.06, 0.24);
    rightMandible.rotation.y = -0.35;
    this.headGroup.add(leftMandible);
    this.headGroup.add(rightMandible);

    // Articulated Antennae
    const leftAntPts = [
      new THREE.Vector3(-0.06, 0.1, 0.15),
      new THREE.Vector3(-0.2, 0.28, 0.45),
      new THREE.Vector3(-0.36, 0.2, 0.72),
    ];
    this.leftAntenna = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(leftAntPts),
      Ant3DModel.antennaMat
    );
    this.headGroup.add(this.leftAntenna);

    const rightAntPts = [
      new THREE.Vector3(0.06, 0.1, 0.15),
      new THREE.Vector3(0.2, 0.28, 0.45),
      new THREE.Vector3(0.36, 0.2, 0.72),
    ];
    this.rightAntenna = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(rightAntPts),
      Ant3DModel.antennaMat
    );
    this.headGroup.add(this.rightAntenna);

    this.group.add(this.headGroup);

    // 3. Petiole Node
    const petioleGeo = new THREE.SphereGeometry(0.1, 4, 4);
    const petioleMesh = new THREE.Mesh(petioleGeo, this.chitinMat);
    petioleMesh.position.set(0, 0.02, -0.42);
    this.group.add(petioleMesh);

    // 4. Abdomen / Gaster
    const abdomenGeo = new THREE.SphereGeometry(0.36, 6, 6);
    abdomenGeo.scale(1.15, 1.05, 1.8);
    this.abdomenMesh = new THREE.Mesh(abdomenGeo, this.chitinMat);
    this.abdomenMesh.position.set(0, 0.08, -0.9);
    this.group.add(this.abdomenMesh);

    // 5. 6 Articulated Legs (Tripod gait)
    const legZOffsets = [0.22, 0.0, -0.24];
    for (let i = 0; i < 3; i++) {
      const leftLegGroup = this.createLeg(true, i);
      leftLegGroup.position.set(-0.2, -0.05, legZOffsets[i]);
      this.legs.push(leftLegGroup);
      this.group.add(leftLegGroup);

      const rightLegGroup = this.createLeg(false, i);
      rightLegGroup.position.set(0.2, -0.05, legZOffsets[i]);
      this.legs.push(rightLegGroup);
      this.group.add(rightLegGroup);
    }

    // 6. Food Cargo Crystal (Held in mandibles)
    const cargoGeo = new THREE.DodecahedronGeometry(0.2);
    this.cargoMesh = new THREE.Mesh(cargoGeo, Ant3DModel.cargoMat);
    this.cargoMesh.position.set(0, 0.05, 0.78);
    this.cargoMesh.visible = false;
    this.headGroup.add(this.cargoMesh);

    // 7. Selection Highlight Ring
    const ringGeo = new THREE.RingGeometry(0.8, 0.95, 16);
    ringGeo.rotateX(-Math.PI / 2);
    this.selectionRing = new THREE.Mesh(ringGeo, Ant3DModel.selectionMat);
    this.selectionRing.position.y = -0.32;
    this.selectionRing.visible = false;
    this.group.add(this.selectionRing);

    // 8. Queen Crown UI Marker
    const crownGeo = new THREE.TorusGeometry(0.6, 0.06, 4, 16);
    crownGeo.rotateX(Math.PI / 2);
    this.queenCrownRing = new THREE.Mesh(crownGeo, Ant3DModel.crownMat);
    this.queenCrownRing.position.set(0, 0.85, 0.2);
    this.queenCrownRing.visible = false;
    this.group.add(this.queenCrownRing);

    // Elevation above ground
    this.group.position.y = 0.35;
  }

  private createLeg(isLeft: boolean, pairIndex: number): THREE.Group {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Femur
    const femurLength = 0.38;
    const femurGeo = new THREE.CylinderGeometry(0.03, 0.025, femurLength, 4);
    femurGeo.translate(0, femurLength / 2, 0);
    femurGeo.rotateZ(sign * 0.95);
    if (pairIndex === 0) femurGeo.rotateY(sign * 0.45);
    if (pairIndex === 2) femurGeo.rotateY(sign * -0.45);

    const femur = new THREE.Mesh(femurGeo, Ant3DModel.legMat);
    group.add(femur);

    // Tibia
    const tibiaLength = 0.45;
    const tibiaGeo = new THREE.CylinderGeometry(0.025, 0.015, tibiaLength, 4);
    tibiaGeo.translate(0, -tibiaLength / 2, 0);
    tibiaGeo.rotateZ(sign * -0.65);
    tibiaGeo.translate(sign * (femurLength * 0.8), femurLength * 0.4, 0);

    const tibia = new THREE.Mesh(tibiaGeo, Ant3DModel.legMat);
    group.add(tibia);

    return group;
  }

  public updatePose(ant: Ant, isSelected = false): void {
    // 1. Update Morphology & Chitin Color if caste/role changes
    const caste = ant.body.caste;
    const role = ant.roleState.primaryRole;

    if (caste !== this.currentCaste || role !== this.currentRole) {
      this.currentCaste = caste;
      this.currentRole = role;

      if (caste === 'QUEEN') {
        this.group.scale.set(1.9, 1.9, 1.9);
        this.abdomenMesh.scale.set(1.6, 1.4, 2.4); // Huge egg-producing gaster
        this.chitinMat.color.setHex(0xd97706); // Royal amber-gold
        if (this.queenCrownRing) this.queenCrownRing.visible = true;
      } else if (caste === 'SOLDIER' || role === 'GUARD') {
        this.group.scale.set(1.3, 1.3, 1.3);
        this.abdomenMesh.scale.set(1.15, 1.05, 1.8);
        this.chitinMat.color.setHex(0x334155); // Dark armored slate
        if (this.queenCrownRing) this.queenCrownRing.visible = false;
      } else if (role === 'NURSE') {
        this.group.scale.set(0.92, 0.92, 0.92);
        this.abdomenMesh.scale.set(1.15, 1.05, 1.8);
        this.chitinMat.color.setHex(0xf59e0b); // Honey gold
        if (this.queenCrownRing) this.queenCrownRing.visible = false;
      } else if (role === 'SCOUT') {
        this.group.scale.set(0.95, 0.95, 0.95);
        this.abdomenMesh.scale.set(1.0, 0.9, 1.6);
        this.chitinMat.color.setHex(0xeab308); // Vibrant yellow-bronze
        if (this.queenCrownRing) this.queenCrownRing.visible = false;
      } else if (role === 'SANITATION') {
        this.group.scale.set(1.05, 1.05, 1.05);
        this.abdomenMesh.scale.set(1.15, 1.05, 1.8);
        this.chitinMat.color.setHex(0x78350f); // Dark ash-bronze
        if (this.queenCrownRing) this.queenCrownRing.visible = false;
      } else {
        // Standard Forager / General Worker
        this.group.scale.set(1.0, 1.0, 1.0);
        this.abdomenMesh.scale.set(1.15, 1.05, 1.8);
        this.chitinMat.color.setHex(0xb45309); // Classic amber-bronze
        if (this.queenCrownRing) this.queenCrownRing.visible = false;
      }
    }

    // 2. Synchronize position
    this.group.position.x = ant.body.position.x;
    this.group.position.z = ant.body.position.y;

    // Heading rotation (Three.js Y axis)
    this.group.rotation.y = -ant.body.heading + Math.PI / 2;

    // Food cargo visibility
    this.cargoMesh.visible = ant.internalState.state.carryingFoodAmount > 0;

    // Selection ring
    this.selectionRing.visible = isSelected;

    // Tripod Gait Kinematics
    const phase = ant.body.gaitPhase;
    const isMoving = ant.body.isMoving;

    // Antennae twitching
    const twitch = Math.sin(phase * 2) * 0.08;
    this.leftAntenna.rotation.y = twitch;
    this.rightAntenna.rotation.y = -twitch;

    for (let i = 0; i < this.legs.length; i++) {
      const leg = this.legs[i];
      const isTripodA = i === 0 || i === 3 || i === 4;
      const legPhase = isTripodA ? phase : phase + Math.PI;

      if (isMoving) {
        leg.rotation.x = Math.sin(legPhase) * 0.45;
        leg.rotation.z = Math.max(0, Math.cos(legPhase)) * 0.25;
      } else {
        leg.rotation.x = 0;
        leg.rotation.z = 0;
      }
    }
  }

  public dispose(): void {
    this.group.clear();
    this.chitinMat.dispose();
  }
}
