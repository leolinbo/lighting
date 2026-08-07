/**
 * Pure lighting design helpers shared across the ENCORE tools.
 *
 * All functions are side-effect free so they can be unit tested, recomputed
 * in SSR and reused by every calculator widget.
 */

export const UNIT_M_PER_FT = 0.3048;
export const METERS_PER_FT = 0.3048;
export const FEET_PER_METER = 1 / 0.3048;

/** Clamp a number into [min, max]. Returns NaN-safe: NaN in -> NaN out. */
export const clamp = (value: number, min: number, max: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(value, min), max) : value;

/** Safe division: returns fallback (default 0) when denominator is not positive. */
export const safeDivide = (a: number, b: number, fallback = 0): number =>
  b > 0 && Number.isFinite(a) && Number.isFinite(b) ? a / b : fallback;

/** Format a number with a maximum of `digits` decimals, comma separated. */
export const formatNumber = (value: number, digits = 2): string => {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
};

/** --- Length / distance conversions --- */

export const metersToFeet = (meters: number): number => meters * FEET_PER_METER;
export const feetToMeters = (feet: number): number => feet * METERS_PER_FT;

/**
 * Factor applied to existing numeric inputs when the calculator unit system
 * switches. The `change` event fires after the <select> has already moved to
 * the NEW unit, so the factor must convert the OLD unit's values into the NEW
 * one: switching to Metric (ft→m) multiplies by 0.3048, switching to Imperial
 * (m→ft) multiplies by 1 / 0.3048.
 */
export const unitSwitchFactor = (newUnitIsMetric: boolean): number =>
  newUnitIsMetric ? METERS_PER_FT : FEET_PER_METER;

/** --- Beam geometry (cone model) --- */

/**
 * Beam diameter on a surface from a fixture at mounting height h (same unit
 * as the returned diameter) with full beam angle `angleDeg` (degrees).
 *
 *   D = 2 * h * tan(θ / 2)
 */
export const beamDiameter = (angleDeg: number, height: number): number => {
  if (!(angleDeg > 0) || !(height > 0)) return NaN;
  const theta = clamp(angleDeg, 0.1, 180);
  const half = (theta * Math.PI) / 360;
  return 2 * height * Math.tan(half);
};

/**
 * Full beam angle (degrees) given beam diameter and mounting distance.
 *
 *   θ = 2 * atan(D / (2 * h))
 */
export const beamAngleFromDiameter = (diameter: number, height: number): number => {
  if (!(diameter > 0) || !(height > 0)) return NaN;
  return (2 * Math.atan(diameter / (2 * height)) * 180) / Math.PI;
};

/** Circular illuminated area for a given beam diameter. */
export const beamArea = (diameter: number): number => {
  if (!(diameter > 0) || !Number.isFinite(diameter)) return NaN;
  const r = diameter / 2;
  return Math.PI * r * r;
};

/** Nearest standard track/downlight beam angle. */
export const nearestStandardAngle = (angle: number): number => {
  const STANDARDS = [10, 15, 24, 30, 36, 45, 60, 90];
  return STANDARDS.reduce((best, current) => (Math.abs(current - angle) < Math.abs(best - angle) ? current : best));
};

/** --- Illuminance (lux / foot-candle) --- */

/**
 * Illuminance in lux: lux = total lumens / area (m²).
 * Use utilFactor (0..1) for light-loss (maintenance factor ~0.8, coefficient of
 * utilization ~0.7 for indirect/ambient installations).
 */
export const luxFromLumens = (lumens: number, areaSqm: number, utilFactor = 1): number =>
  safeDivide(lumens * utilFactor, areaSqm);

export const fcFromLumens = (lumens: number, areaSqft: number, utilFactor = 1): number =>
  safeDivide(lumens * utilFactor, areaSqft);

/** Total lumens required to reach `targetLux` over `areaSqm`. */
export const requiredLumens = (targetLux: number, areaSqm: number, utilFactor = 1): number =>
  (targetLux * areaSqm) / clamp(utilFactor || 1, 0.01, 1);

/** Number of fixtures needed given fixture lumens and required lumens. */
export const fixtureCount = (requiredLumens: number, lumensPerFixture: number): number => {
  if (!(lumensPerFixture > 0)) return NaN;
  return Math.ceil(safeDivide(requiredLumens, lumensPerFixture));
};

/**
 * Recommended lux ranges by application (lighting design common practice).
 * Returns [minLux, maxLux, note].
 */
export const luxRecommendation = (application: string): { min: number; max: number; note: string } => {
  const table: Record<string, { min: number; max: number; note: string }> = {
    retail: { min: 300, max: 750, note: 'General retail floor; use 750–1500 lux on display focal points.' },
    showroom: { min: 400, max: 1000, note: 'Showrooms need high vertical illuminance to flatter products.' },
    office: { min: 300, max: 500, note: 'EN 12464-1 recommends 500 lux on office work planes.' },
    hospitality: { min: 100, max: 300, note: 'Hotels and restaurants prefer warm, lower-level ambient light.' },
    museum: { min: 50, max: 300, note: 'Light-sensitive exhibits: 50 lux, general galleries up to 300 lux.' },
    warehouse: { min: 150, max: 300, note: 'Aisles and racking benefit from uniform high-bay lighting.' },
    industrial: { min: 200, max: 500, note: 'Detail tasks may need 500 lux+ on the work plane.' },
    residential: { min: 150, max: 300, note: 'General living areas; task corners can go higher.' },
    parking: { min: 50, max: 100, note: 'Car parks and ramps need modest but uniform levels.' },
  };
  return table[application] ?? { min: 300, max: 500, note: 'Typical commercial target range.' };
};

/** --- Color temperature guidance --- */

export interface CctInfo {
  kelvin: number;
  name: string;
  feel: string;
  bestFor: string[];
  mood: string;
}

export const CCT_STANDARDS: CctInfo[] = [
  {
    kelvin: 2700,
    name: 'Warm White',
    feel: 'Cozy, intimate, golden',
    bestFor: ['hotels', 'restaurants', 'lounges', 'residential bedrooms'],
    mood: 'Relaxed and inviting',
  },
  {
    kelvin: 3000,
    name: 'Warm Neutral',
    feel: 'Soft, premium, welcoming',
    bestFor: ['retail fashion', 'hospitality lobbies', 'dining', 'art walls'],
    mood: 'Comfortable with a touch of energy',
  },
  {
    kelvin: 3500,
    name: 'Neutral White',
    feel: 'Balanced, crisp but warm',
    bestFor: ['offices', 'reception areas', 'multi-purpose spaces'],
    mood: 'Focused and natural',
  },
  {
    kelvin: 4000,
    name: 'Cool White / Natural',
    feel: 'Bright, clean, alert',
    bestFor: ['offices', 'retail supermarkets', 'clinics', 'workshops'],
    mood: 'Clean and productive',
  },
  {
    kelvin: 5000,
    name: 'Daylight',
    feel: 'Crisp, clinical, high contrast',
    bestFor: ['factories', 'garages', 'gyms', 'task inspection'],
    mood: 'Energizing and precise',
  },
  {
    kelvin: 6500,
    name: 'Cool Daylight',
    feel: 'Sterile, very bright, blue-tinted',
    bestFor: ['industrial halls', 'outdoor security', 'inspection lines'],
    mood: 'Maximum alertness',
  },
];

export const cctInfo = (kelvin: number): CctInfo => {
  const table = CCT_STANDARDS.reduce<Record<number, CctInfo>>((acc, item) => {
    acc[item.kelvin] = item;
    return acc;
  }, {});
  const exact = table[kelvin];
  if (exact) return exact;
  // Pick nearest standard for arbitrary values.
  return CCT_STANDARDS.reduce((best, current) =>
    Math.abs(current.kelvin - kelvin) < Math.abs(best.kelvin - kelvin) ? current : best
  );
};

/** --- CRI guidance --- */

export const criTier = (cri: number): { label: string; detail: string; tone: string } => {
  if (cri >= 95)
    return {
      label: 'Museum / Art grade',
      detail: '95+ — used for galleries, luxury retail and artwork where color fidelity is critical.',
      tone: 'excellent',
    };
  if (cri >= 90)
    return {
      label: 'Premium',
      detail: '90+ — recommended for retail, hospitality and anything where products must look their best.',
      tone: 'great',
    };
  if (cri >= 80)
    return { label: 'Standard', detail: '80+ — acceptable for general commercial and office lighting.', tone: 'ok' };
  return {
    label: 'Budget / Basic',
    detail: 'Below 80 — colors look washed out; avoid for retail, food or fabric displays.',
    tone: 'poor',
  };
};

/** --- UGR reference --- */

export interface UgrInfo {
  value: number;
  label: string;
  detail: string;
}

export const UGR_TABLE: UgrInfo[] = [
  {
    value: 10,
    label: 'Ideal',
    detail: 'Very dark ceilings and accent lighting; only reachable with deep-shielded optics.',
  },
  { value: 13, label: 'Excellent', detail: 'Preferred for meeting rooms and video conferencing.' },
  { value: 16, label: 'Very good', detail: 'General office and educational spaces.' },
  { value: 19, label: 'Good / standard', detail: 'Maximum commonly specified for offices and retail (EN 12464-1).' },
  { value: 22, label: 'Acceptable', detail: 'Industrial and utility areas where glare is less critical.' },
  { value: 25, label: 'Poor', detail: 'High glare; only for circulation and storage areas.' },
  { value: 28, label: 'Very poor', detail: 'Discomfort glare likely; should be avoided where people work.' },
];

/** Map a UGR value to a descriptive entry. */
export const ugrInfo = (value: number): UgrInfo =>
  UGR_TABLE.reduce((best, current) =>
    Math.abs(current.value - value) < Math.abs(best.value - value) ? current : best
  );

/** --- Wattage helpers --- */

/** Typical luminous efficacy by technology (lm/W), used for estimates. */
export const lumenPerWatt = (technology: 'led' | 'halogen' | 'cfl' | 'incandescent'): number => {
  switch (technology) {
    case 'led':
      return 110;
    case 'cfl':
      return 60;
    case 'halogen':
      return 18;
    case 'incandescent':
      return 13;
    default:
      return 110;
  }
};

/** Estimate lumens from wattage using an efficacy guess. */
export const lumensFromWatts = (watts: number, technology: 'led' | 'halogen' | 'cfl' | 'incandescent'): number =>
  clamp(watts, 0, 5000) * lumenPerWatt(technology);

/** --- Unit converters --- */

export interface UnitResult {
  from: string;
  to: string;
  value: number;
  formula: string;
}

export const lengthConvert = (value: number, from: 'm' | 'ft'): UnitResult =>
  from === 'm'
    ? { from: 'm', to: 'ft', value: metersToFeet(value), formula: 'value × 3.28084' }
    : { from: 'ft', to: 'm', value: feetToMeters(value), formula: 'value × 0.3048' };

export const areaConvert = (value: number, from: 'm2' | 'ft2'): UnitResult =>
  from === 'm2'
    ? { from: 'm²', to: 'ft²', value: value * FEET_PER_METER * FEET_PER_METER, formula: 'value × 10.7639' }
    : { from: 'ft²', to: 'm²', value: value * METERS_PER_FT * METERS_PER_FT, formula: 'value × 0.092903' };

export const luxToFc = (lux: number): number => lux * 0.092903;
export const fcToLux = (fc: number): number => fc * 10.7639;

export const wattToVa = (watts: number, powerFactor = 0.95): number =>
  safeDivide(watts, clamp(powerFactor || 1, 0.01, 1));

export const vaToWatt = (va: number, powerFactor = 0.95): number => va * clamp(powerFactor || 1, 0.01, 1);

/** --- Fixture count layout helpers --- */

export interface FixtureLayout {
  rows: number;
  cols: number;
  total: number;
  spacingX: number;
  spacingY: number;
}

/** Suggest a grid layout (rows × cols) that covers `count` fixtures across a room. */
export const gridLayout = (count: number, roomLength: number, roomWidth: number): FixtureLayout => {
  if (!(count > 0) || !(roomLength > 0) || !(roomWidth > 0)) {
    return { rows: 0, cols: 0, total: 0, spacingX: 0, spacingY: 0 };
  }
  const ratio = roomLength / Math.max(roomWidth, 0.01);
  const colsBest = Math.max(1, Math.round(Math.sqrt(count * ratio)));
  const rowsBest = Math.max(1, Math.ceil(count / colsBest));
  const total = rowsBest * colsBest;
  return {
    rows: rowsBest,
    cols: colsBest,
    total,
    spacingX: roomLength / colsBest,
    spacingY: roomWidth / rowsBest,
  };
};
