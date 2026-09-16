/**
 * ANT BRAIN — Environmental State Model
 * Handles temperature, day/night diurnal cycle, season, and atmospheric conditions.
 */

export interface EnvironmentConfig {
  temperatureCelsius: number; // base ~24C
  dayNightCycleEnabled: boolean;
  dayLengthSeconds: number; // default 120s per full 24h cycle
  seasonLengthSeconds: number;
  foodRegenerationRate: number; // rate at which resources slowly replenish
  predatorSpawnProbability: number;
  dangerLevel: number; // 0 to 1
  windSpeed: number;
  windAngle: number; // radians
}

export class Environment {
  public config: EnvironmentConfig;
  public timeOfDay: number = 0.35; // 0.0 (midnight), 0.25 (dawn), 0.5 (noon), 0.75 (dusk)
  public seasonProgress: number = 0.2; // 0=Spring, 0.25=Summer, 0.5=Autumn, 0.75=Winter
  public currentTemperature: number = 24.0;
  public ambientLightLevel: number = 1.0; // 0.15 (night) to 1.0 (noon)

  constructor(customConfig?: Partial<EnvironmentConfig>) {
    this.config = {
      temperatureCelsius: 24.0,
      dayNightCycleEnabled: true,
      dayLengthSeconds: 120.0,
      seasonLengthSeconds: 600.0,
      foodRegenerationRate: 0.02,
      predatorSpawnProbability: 0.005,
      dangerLevel: 0.2,
      windSpeed: 0.5,
      windAngle: 0.0,
      ...customConfig,
    };
    this.updateAtmosphere(0);
  }

  public update(dt: number, totalSimTime: number): void {
    if (this.config.dayNightCycleEnabled) {
      this.timeOfDay = (totalSimTime / this.config.dayLengthSeconds) % 1.0;
    }
    this.seasonProgress = (totalSimTime / this.config.seasonLengthSeconds) % 1.0;
    this.updateAtmosphere(dt);
  }

  private updateAtmosphere(_dt: number): void {
    // Solar irradiance curve: smooth sine wave
    const sunAngle = this.timeOfDay * Math.PI * 2;
    // Peak at noon (timeOfDay=0.5 -> sin(PI)=0 -> adjust phase so peak is noon)
    const solarFactor = Math.max(0, Math.sin(sunAngle - Math.PI / 2));

    this.ambientLightLevel = 0.18 + 0.82 * solarFactor;

    // Diurnal temperature swing: +/- 6 degrees C
    const diurnalSwing = (solarFactor - 0.5) * 12.0;
    this.currentTemperature = this.config.temperatureCelsius + diurnalSwing;
  }

  public getDayPhaseName(): string {
    if (this.timeOfDay < 0.2) return 'Night';
    if (this.timeOfDay < 0.3) return 'Dawn';
    if (this.timeOfDay < 0.7) return 'Day';
    if (this.timeOfDay < 0.8) return 'Dusk';
    return 'Night';
  }

  public getSeasonName(): string {
    if (this.seasonProgress < 0.25) return 'Spring';
    if (this.seasonProgress < 0.5) return 'Summer';
    if (this.seasonProgress < 0.75) return 'Autumn';
    return 'Winter';
  }
}
