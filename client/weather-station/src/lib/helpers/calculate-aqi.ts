export enum AqiCategory {
    Good,
    Moderate,
    UnhealthyForSensitive,
    Unhealthy,
    VeryUnhealthy,
    Hazardous
};

export const aqiCategoryNames: { [key in AqiCategory]: string} = {
    [AqiCategory.Good]: 'Добро',
    [AqiCategory.Moderate]: 'Умерено',
    [AqiCategory.UnhealthyForSensitive]: 'Штетно за чувствителни',
    [AqiCategory.Unhealthy]: 'Штетно',
    [AqiCategory.VeryUnhealthy]: 'Многу штетно',
    [AqiCategory.Hazardous]: 'Опасно'
};

export const aqiCategoryClassNames: { [key in AqiCategory]: string} = {
    [AqiCategory.Good]: 'aqi-good',
    [AqiCategory.Moderate]: 'aqi-moderate',
    [AqiCategory.UnhealthyForSensitive]: 'aqi-unhealthy',
    [AqiCategory.Unhealthy]: 'aqi-very-unhealthy',
    [AqiCategory.VeryUnhealthy]: 'aqi-severe',
    [AqiCategory.Hazardous]: 'aqi-hazardous'
};

export interface AqiResult {
    nowcastConcentration: number;
    aqi: number;
    category: AqiCategory,
    hoursUsed: number
};

type Pollutant = "pm25" | "pm10";

// Breakpoints
const PM25_BREAKPOINTS = [
  { cLow: 0.0,   cHigh: 12.0,   iLow: 0,   iHigh: 50 },
  { cLow: 12.1,  cHigh: 35.4,   iLow: 51,  iHigh: 100 },
  { cLow: 35.5,  cHigh: 55.4,   iLow: 101, iHigh: 150 },
  { cLow: 55.5,  cHigh: 150.4,  iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4,  iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4,  iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4,  iLow: 401, iHigh: 500 }
];

const PM10_BREAKPOINTS = [
  { cLow: 0,   cHigh: 54,   iLow: 0,   iHigh: 50 },
  { cLow: 55,  cHigh: 154,  iLow: 51,  iHigh: 100 },
  { cLow: 155, cHigh: 254,  iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354,  iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424,  iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 504,  iLow: 301, iHigh: 400 },
  { cLow: 505, cHigh: 604,  iLow: 401, iHigh: 500 }
];

function getBreakpoints(type: Pollutant) {
  return type === "pm25" ? PM25_BREAKPOINTS : PM10_BREAKPOINTS;
}

// AQI conversion
function concentrationToAqi(c: number, type: Pollutant): number {
  for (const bp of getBreakpoints(type)) {
    c = Math.round(c);
    if (c >= bp.cLow && c <= bp.cHigh) {
      const aqi =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }
  return NaN;
}

// Optional category
function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return AqiCategory.Good;
  if (aqi <= 100) return AqiCategory.Moderate;
  if (aqi <= 150) return AqiCategory.UnhealthyForSensitive;
  if (aqi <= 200) return AqiCategory.Unhealthy;
  if (aqi <= 300) return AqiCategory.VeryUnhealthy;
  return AqiCategory.Hazardous;
}

// NowCast - with any number of hourly values (1–12)
function nowcast(hourly: number[]): number {
  const cMax = Math.max(...hourly);
  const cMin = Math.min(...hourly);
  if (cMax === 0) return 0;

  const scaled = (cMax - cMin) / cMax;
  let w = 1 - scaled;
  if (w < 0.5) w = 0.5;

  let num = 0;
  let den = 0;

  for (let h = 0; h < hourly.length; h++) {
    const weight = Math.pow(w, h);
    num += hourly[hourly.length - 1 - h] * weight;
    den += weight;
  }

  return num / den;
}

// MAIN — accepts variable-length minute data
export function calculateAqiFromMinutes(
  minuteData: number[],
  type: Pollutant
): AqiResult {
  if (minuteData.length < 10) {
    throw new Error("Not enough data to compute AQI (need ~10+ samples).");
  }

  // Use last 720 minutes max
  const recent = minuteData.slice(-720);

  // Build hourly averages dynamically
  const hourly: number[] = [];
  for (let i = recent.length; i > 0; i -= 60) {
    const chunk = recent.slice(Math.max(0, i - 60), i);
    const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length;
    hourly.unshift(avg);
  }

  // Keep only last 12 hours
  const last12h = hourly.slice(-12);

  const nowcastConc = nowcast(last12h);
  const aqi = concentrationToAqi(nowcastConc, type);

  return {
    nowcastConcentration: nowcastConc,
    aqi,
    category: aqiCategory(aqi),
    hoursUsed: last12h.length
  };
}