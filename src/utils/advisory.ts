import { PsiBandInfo, Pm25BandInfo } from '../types/weather';

export function getPsiBand(value: number): PsiBandInfo {
  if (value <= 50) {
    return {
      band: 'Good',
      color: '#10B981', // emerald-500
      fillColor: '#10B981',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-500',
      badgeBorder: 'border-emerald-600',
      min: 0,
      max: 50,
      generalAdvice: 'Normal activities can be carried out.',
      vulnerableAdvice: 'Normal activities can be carried out.',
    };
  }
  if (value <= 100) {
    return {
      band: 'Moderate',
      color: '#0284C7', // sky-600
      fillColor: '#0284C7',
      textColor: 'text-sky-700',
      badgeBg: 'bg-sky-600',
      badgeBorder: 'border-sky-700',
      min: 51,
      max: 100,
      generalAdvice: 'Normal activities can be carried out.',
      vulnerableAdvice: 'Normal activities can be carried out.',
    };
  }
  if (value <= 200) {
    return {
      band: 'Unhealthy',
      color: '#D97706', // amber-600
      fillColor: '#D97706',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-600',
      badgeBorder: 'border-amber-700',
      min: 101,
      max: 200,
      generalAdvice: 'Reduce prolonged or strenuous outdoor physical exertion.',
      vulnerableAdvice: 'Minimize outdoor physical exertion. Elderly, pregnant women, and children should stay indoors.',
    };
  }
  if (value <= 300) {
    return {
      band: 'Very Unhealthy',
      color: '#DC2626', // red-600
      fillColor: '#DC2626',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-600',
      badgeBorder: 'border-red-700',
      min: 201,
      max: 300,
      generalAdvice: 'Avoid prolonged or strenuous outdoor physical exertion.',
      vulnerableAdvice: 'Avoid outdoor activity. Stay indoors, keep windows closed, and use an air purifier.',
    };
  }
  return {
    band: 'Hazardous',
    color: '#881337', // rose-900 / dark maroon
    fillColor: '#881337',
    textColor: 'text-rose-900',
    badgeBg: 'bg-rose-900',
    badgeBorder: 'border-rose-950',
    min: 301,
    max: 500,
    generalAdvice: 'Minimize or avoid outdoor activity. Keep doors and windows closed.',
    vulnerableAdvice: 'Stay indoors at all times. Persons with chronic lung or heart disease must seek medical help if symptomatic.',
  };
}

export function getPm25Band(value: number): Pm25BandInfo {
  if (value <= 55) {
    return {
      band: 'Band I (Normal)',
      shortBand: 'Normal',
      color: '#10B981',
      fillColor: '#10B981',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-500',
      badgeBorder: 'border-emerald-600',
      min: 0,
      max: 55,
      generalAdvice: 'Normal activities can be continued.',
    };
  }
  if (value <= 150) {
    return {
      band: 'Band II (Elevated)',
      shortBand: 'Elevated',
      color: '#0284C7',
      fillColor: '#0284C7',
      textColor: 'text-sky-700',
      badgeBg: 'bg-sky-600',
      badgeBorder: 'border-sky-700',
      min: 56,
      max: 150,
      generalAdvice: 'Normal activities can be continued. Those not feeling well should reduce strenuous exertion.',
    };
  }
  if (value <= 250) {
    return {
      band: 'Band III (High)',
      shortBand: 'High',
      color: '#D97706',
      fillColor: '#D97706',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-600',
      badgeBorder: 'border-amber-700',
      min: 151,
      max: 250,
      generalAdvice: 'Reduce strenuous outdoor exertion.',
    };
  }
  return {
    band: 'Band IV (Very High)',
    shortBand: 'Very High',
    color: '#DC2626',
    fillColor: '#DC2626',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-600',
    badgeBorder: 'border-red-700',
    min: 251,
    max: 500,
    generalAdvice: 'Avoid strenuous outdoor exertion.',
  };
}

export function getRainBand(mm: number): {
  label: string;
  color: string;
  fillColor: string;
  radius: number;
} {
  if (mm <= 0) {
    return {
      label: 'No Rain',
      color: '#94A3B8', // slate-400
      fillColor: '#E2E8F0',
      radius: 4,
    };
  }
  if (mm <= 2.0) {
    return {
      label: 'Light Rain (0.1–2.0 mm)',
      color: '#0284C7', // sky-600
      fillColor: '#38BDF8',
      radius: 7,
    };
  }
  if (mm <= 5.0) {
    return {
      label: 'Moderate Rain (2.1–5.0 mm)',
      color: '#1D4ED8', // blue-700
      fillColor: '#2563EB',
      radius: 11,
    };
  }
  return {
    label: 'Heavy Rain (>5.0 mm)',
    color: '#6B21A8', // purple-800
    fillColor: '#9333EA',
    radius: 16,
  };
}

/**
 * Format string as Singapore Time (UTC+8)
 */
export function formatToSGT(dateStr?: string | Date): string {
  if (!dateStr) return '--:-- SGT';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '--:-- SGT';
    
    return d.toLocaleTimeString('en-SG', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' SGT';
  } catch {
    return '--:-- SGT';
  }
}

export function formatFullSGT(dateStr?: string | Date): string {
  if (!dateStr) return 'Unknown';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return 'Unknown';
    
    return d.toLocaleDateString('en-SG', {
      timeZone: 'Asia/Singapore',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' SGT';
  } catch {
    return 'Unknown';
  }
}
