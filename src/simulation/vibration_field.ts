/**
 * ANT BRAIN — Substrate Acoustic Vibration & Stridulation Field
 * Simulates mechanical wave propagation through plant tissue and nest soil:
 * 1. Stridulation during leaf cutting (mandibular cutting recruitment).
 * 2. Alarm resonance during predator defense.
 * 3. Spatial attenuation, frequency propagation, and sensor pickup by subgenual organs.
 */

import { Vector2D, VibrationSignal } from './types';

export class SubstrateVibrationField {
  public signals: VibrationSignal[] = [];
  private nextSignalId = 1;

  public emitSignal(
    emitterId: string,
    position: Vector2D,
    purpose: VibrationSignal['purpose'] = 'LEAF_CUTTING',
    amplitude = 1.0,
    frequencyHz = 850
  ): VibrationSignal {
    const signal: VibrationSignal = {
      id: `vib-${this.nextSignalId++}`,
      emitterId,
      position: { ...position },
      frequencyHz,
      amplitude: Math.min(1.0, Math.max(0.1, amplitude)),
      radius: purpose === 'ALARM_DEFENSE' ? 12.0 : 6.5,
      purpose,
      timestamp: performance.now() / 1000,
      decayRate: 1.8, // Attenuates rapidly per second
    };
    this.signals.push(signal);
    return signal;
  }

  /**
   * Sample net vibration stimulus at a specific spatial coordinate
   */
  public sampleVibrationAt(pos: Vector2D): { intensity: number; direction: Vector2D | null; dominantPurpose: VibrationSignal['purpose'] | null } {
    let totalIntensity = 0;
    let dirX = 0;
    let dirY = 0;
    let dominantPurpose: VibrationSignal['purpose'] | null = null;
    let maxAmp = 0;

    for (const sig of this.signals) {
      const dx = sig.position.x - pos.x;
      const dy = sig.position.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < sig.radius && dist > 0.05) {
        const falloff = (1.0 - dist / sig.radius) * sig.amplitude;
        totalIntensity += falloff;
        dirX += (dx / dist) * falloff;
        dirY += (dy / dist) * falloff;

        if (falloff > maxAmp) {
          maxAmp = falloff;
          dominantPurpose = sig.purpose;
        }
      }
    }

    const netLen = Math.hypot(dirX, dirY);
    const direction = netLen > 0.01 ? { x: dirX / netLen, y: dirY / netLen } : null;

    return {
      intensity: Math.min(1.0, totalIntensity),
      direction,
      dominantPurpose,
    };
  }

  public update(dt: number): void {
    for (let i = this.signals.length - 1; i >= 0; i--) {
      const sig = this.signals[i];
      sig.amplitude -= dt * sig.decayRate;
      if (sig.amplitude <= 0.05) {
        this.signals.splice(i, 1);
      }
    }
  }

  public clear(): void {
    this.signals = [];
  }
}
