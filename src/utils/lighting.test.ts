import { describe, it, expect } from 'vitest';

import {
  beamDiameter,
  beamAngleFromDiameter,
  beamArea,
  nearestStandardAngle,
  requiredLumens,
  fixtureCount,
  gridLayout,
  metersToFeet,
  feetToMeters,
  luxToFc,
  fcToLux,
  wattToVa,
  cctInfo,
  criTier,
  ugrInfo,
} from './lighting';

describe('beam geometry', () => {
  it('computes beam diameter for 24° at 3 m', () => {
    expect(beamDiameter(24, 3)).toBeCloseTo(1.28, 2);
  });

  it('computes beam diameter for 60° at 3 ft (imperial in same units)', () => {
    expect(beamDiameter(60, 3)).toBeCloseTo(3.46, 2);
  });

  it('computes beam diameter for 36° at 4 m', () => {
    expect(beamDiameter(36, 4)).toBeCloseTo(2.6, 2);
  });

  it('computes beam diameter for 15° at 10 ft', () => {
    expect(beamDiameter(15, 10)).toBeCloseTo(2.63, 2);
  });

  it('computes the inverse beam angle', () => {
    const d = beamDiameter(24, 3);
    expect(beamAngleFromDiameter(d, 3)).toBeCloseTo(24, 1);
  });

  it('computes circular beam area for 1.28 m diameter', () => {
    expect(beamArea(1.28)).toBeCloseTo(1.29, 1);
  });

  it('returns NaN for invalid inputs', () => {
    expect(Number.isNaN(beamDiameter(0, 3))).toBe(true);
    expect(Number.isNaN(beamDiameter(24, 0))).toBe(true);
    expect(Number.isNaN(beamAngleFromDiameter(0, 3))).toBe(true);
  });

  it('finds nearest standard beam angle', () => {
    expect(nearestStandardAngle(24.5)).toBe(24);
    expect(nearestStandardAngle(31)).toBe(30);
  });
});

describe('lux & fixture count', () => {
  it('matches the spec acceptance value: 100 m² @ 300 lux → 62,500 lm', () => {
    expect(requiredLumens(300, 100, 0.6 * 0.8)).toBeCloseTo(62500, 0);
  });

  it('matches the spec: 3000 lm per fixture → 21 fixtures', () => {
    expect(fixtureCount(62500, 3000)).toBe(21);
  });

  it('matches retail 8×6 m default: 525 lux, CU 0.6 × MF 0.8 → 52,500 lm / 32 fixtures', () => {
    const lumens = requiredLumens(525, 48, 0.6 * 0.8);
    expect(lumens).toBeCloseTo(52500, 0);
    expect(fixtureCount(lumens, 15 * 110)).toBe(32);
  });

  it('suggests a grid layout covering the count', () => {
    const grid = gridLayout(32, 8, 6);
    expect(grid.rows * grid.cols).toBeGreaterThanOrEqual(28);
    expect(grid.rows).toBeGreaterThan(0);
    expect(grid.cols).toBeGreaterThan(0);
  });

  it('returns zero layout for invalid count', () => {
    expect(gridLayout(0, 8, 6).total).toBe(0);
  });
});

describe('unit conversions', () => {
  it('converts meters to feet and back', () => {
    expect(metersToFeet(3)).toBeCloseTo(9.84, 2);
    expect(feetToMeters(3)).toBeCloseTo(0.9144, 4);
    expect(feetToMeters(metersToFeet(3))).toBeCloseTo(3, 3);
  });

  it('converts lux to foot-candles and back', () => {
    expect(luxToFc(500)).toBeCloseTo(46.45, 1);
    expect(fcToLux(luxToFc(500))).toBeCloseTo(500, 1);
  });

  it('converts watts to VA at 0.95 power factor', () => {
    expect(wattToVa(15)).toBeCloseTo(15.79, 1);
  });
});

describe('references', () => {
  it('returns CCT info for a standard kelvin value', () => {
    expect(cctInfo(3000).name).toBe('Warm Neutral');
  });

  it('returns CRI tier for 90+', () => {
    expect(criTier(90).label).toContain('Premium');
  });

  it('returns UGR info near 19', () => {
    expect(ugrInfo(19).value).toBe(19);
  });
});
